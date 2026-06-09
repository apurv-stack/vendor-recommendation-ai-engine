import { useEffect, useState } from "react";

import {
     
    getSessions,
    
    renameSession,

    deleteSession

} from "../../api/sessionApi";

const ChatHistorySidebar = ({

    onSessionSelect,

    onNewChat,

    selectedSessionId,

    refreshTrigger

}) => {

    const [

        sessions,

        setSessions

    ] = useState([]);

    const [

        menuOpen,

        setMenuOpen

    ] = useState(null);

    const [

        loading,

        setLoading

    ] = useState(true);

    useEffect(() => {

        loadSessions();

    }, [refreshTrigger]);

    const loadSessions = async () => {

        try {

            const response = await getSessions();

            setSessions(

                response.sessions || []

            );

        }

        catch (

            error

        ) {

            console.error(

                "Unable to load sessions",

                error

            );

        }

        finally {

            setLoading(false);

        }

    };

    const handleRename = async (
        sessionId
    ) => {

        const title = window.prompt(
            "Enter new chat title"
        );

        if (!title) {
            return;
        }   

        try {

            await renameSession(
                sessionId,
                title
            );

            await loadSessions();

        } catch (error) {

            console.error(
                "Rename failed",
                error
            );

        }

    };

    const handleDelete = async (
        sessionId
    ) => {

        const confirmed = window.confirm(
            "Delete this chat?"
        );

        if (!confirmed) {
            return;
        }

        try {

            await deleteSession(
                sessionId
            );

            await loadSessions();

        } catch (error) {

            console.error(
                "Delete failed",
                error
            );

        }

    };

    return (

        <div
            className="
                w-80
                border-r
                bg-white
                h-full
                overflow-y-auto
            "
        >

            <div className="p-4">

                <button

                    onClick={onNewChat}

                    className="
                        w-full
                        rounded-lg
                        bg-black
                        text-white
                        py-2
                    "

                >

                    + New Chat

                </button>

            </div>

            <div className="px-2">

                {

                    loading

                    ?

                    <p>

                        Loading...

                    </p>

                    :

                    sessions.map(

                        (

                            session

                        ) => (

                            <div

                                key={
                                    session.session_id
                                }

                                className="
                                    relative
                                    flex
                                    items-start
                                    gap-2
                                    mb-2
                                "

                            >

                                <button

                                    onClick={() =>
                                        onSessionSelect(
                                            session.session_id
                                        )
                                    }

                                    className={`
                                        flex-1
                                        text-left
                                        p-3
                                        rounded-lg
                                        transition

                                        ${
                                            selectedSessionId ===
                                            session.session_id

                                            ?

                                            "bg-gray-200 border border-gray-400"

                                            :

                                            "hover:bg-gray-100"
                                        }
                                    `}

                                >

                                    <div
                                        className="
                                            text-sm
                                            font-medium
                                        "
                                    >

                                        {

                                            session.title
                                            ||
                                            session.preview

                                        }

                                    </div>

                                    </button>

                                    <button

                                        onClick={() =>
                                            setMenuOpen(

                                                menuOpen ===
                                                session.session_id

                                                ?

                                                null

                                                :

                                                session.session_id

                                            )
                                        }

                                        className="
                                            px-2
                                            py-1
                                        "

                                    >

                                        ⋮

                                    </button>

                                    {

                                        menuOpen ===
                                        session.session_id

                                        &&

                                        <div

                                            className="
                                                absolute
                                                right-0
                                                top-8
                                                bg-white
                                                border
                                                rounded
                                                shadow
                                                z-50
                                            "

                                        >

                                        <button

                                            onClick={() =>
                                                handleRename(
                                                    session.session_id
                                                )
                                            }

                                            className="
                                                block
                                                w-full
                                                px-4
                                                py-2
                                                text-left
                                                hover:bg-gray-100
                                            "

                                        >

                                            Rename

                                        </button>

                                        <button

                                            onClick={() =>
                                                handleDelete(
                                                    session.session_id
                                                )
                                            }

                                            className="
                                                block
                                                w-full
                                                px-4
                                                py-2
                                                text-left
                                                hover:bg-gray-100
                                            "

                                        >

                                            Delete

                                        </button>

                                    </div>

                                }

                            </div>

                        )

                    )

                }

            </div>

        </div>

    );

};

export default ChatHistorySidebar;