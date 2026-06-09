import { useState } from "react";

import ChatWindow from "../../components/chat/ChatWindow";

import ChatHistorySidebar from "../../components/chat/ChatHistorySidebar";


const ChatPage = () => {

    const [

        selectedSessionId,

        setSelectedSessionId

    ] = useState(null);

    const [

        refreshKey,

        setRefreshKey

    ] = useState(0);

    const [

        sidebarRefresh,

        setSidebarRefresh

    ] = useState(0);

    const [

        sidebarCollapsed,

        setSidebarCollapsed

    ] = useState(false);

    const handleSessionSelect = (

        sessionId

    ) => {

        setSelectedSessionId(

            sessionId

        );

    };

    const handleNewChat = () => {

        setSelectedSessionId(

            null

        );

        setRefreshKey(

            prev => prev + 1
        );

        setSidebarRefresh(
            prev => prev + 1
        );

    };

    const handleSessionCreated = () => {
        setSidebarRefresh(prev => prev + 1);
    };

    return (

        <div

            className="
                h-[calc(100vh-80px)]
                flex
            "

        >
            <button

                onClick={() =>
                    setSidebarCollapsed(
                        prev => !prev
                    )
                }

                className="
                    absolute
                    top-4
                    left-4
                    z-50
                    bg-white
                    border
                    rounded
                    px-3
                    py-2
                    shadow
                "

            >

                ☰

            </button>

            {

                !sidebarCollapsed && (

                    <ChatHistorySidebar

                        refreshTrigger={
                            sidebarRefresh
                        }

                        onSessionSelect={
                            handleSessionSelect
                        }

                        onNewChat={
                            handleNewChat
                        }

                        selectedSessionId={
                            selectedSessionId
                        }

                    />

                )

            }

            <div

                className="
                    flex-1
                    p-6
                "

            >

                <h1

                    className="
                        text-2xl
                        font-semibold
                        mb-4
                    "

                >

                    AI Vendor Assistant

                </h1>

                <ChatWindow

                    key={refreshKey}

                    selectedSessionId={
                        selectedSessionId
                    }

                    onSessionCreated={handleSessionCreated}

                />

            </div>

        </div>

    );

};

export default ChatPage;