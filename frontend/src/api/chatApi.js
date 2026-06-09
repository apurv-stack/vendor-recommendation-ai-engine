import axiosInstance from "./axiosInstance";


const REQUEST_TIMEOUT = 180000;

const MAX_RETRIES = 1;

let activeController = null;


const sleep = (

    ms

) =>

    new Promise(

        resolve =>

            setTimeout(

                resolve,

                ms

            )

    );


const normalizeResponse = (

    data

) => ({

    success:

        Boolean(

            data?.success

        ),

    message:

        data?.message

        ||

        "",

    session_id:

        data?.session_id

        ||

        null,

    response_type:

        data?.response_type

        ||

        "chat",

    current_question:

        data?.current_question

        ||

        null,

    missing_fields:

        Array.isArray(

            data?.missing_fields

        )

            ?

            data.missing_fields

            :

            [],

    recommendations:

        Array.isArray(

            data?.recommendations

        )

            ?

            data.recommendations

            :

            [],

    error:

        data?.error

        ||

        null

});


const normalizeError = (

    error

) => {

    if (

        error?.name

        ===

        "CanceledError"

        ||

        error?.code

        ===

        "ERR_CANCELED"

    ) {

        return {

            success: false,

            message: "",

            session_id: null,

            response_type: "error",

            current_question: null,

            missing_fields: [],

            recommendations: [],

            error: "Previous request cancelled."

        };

    }

    if (

        error?.code

        ===

        "ECONNABORTED"

    ) {

        return {

            success: false,

            message: "",

            session_id: null,

            response_type: "error",

            current_question: null,

            missing_fields: [],

            recommendations: [],

            error:

                "Request timed out. Please try again."

        };

    }

    if (

        error?.response

    ) {

        return {

            success: false,

            message: "",

            session_id: null,

            response_type: "error",

            current_question: null,

            missing_fields: [],

            recommendations: [],

            error:

                error.response.data?.error

                ||

                error.response.data?.detail

                ||

                "Backend error"

        };

    }

    return {

        success: false,

        message: "",

        session_id: null,

        response_type: "error",

        current_question: null,

        missing_fields: [],

        recommendations: [],

        error:

            "Unable to connect. Check internet connection."

    };

};


export const sendMessage = async (

    message,

    sessionId,

    retry = 0

) => {

    try {

        if (

            activeController

        ) {

            activeController.abort();

        }

        activeController =

            new AbortController();

        const response =

            await axiosInstance.post(

                "/chat/message",

                {

                    message,

                    session_id:

                        sessionId

                },

                {

                    timeout:

                        REQUEST_TIMEOUT,

                    signal:

                        activeController.signal

                }

            );

        activeController = null;

        return normalizeResponse(

            response.data

        );

    }

    catch (

        error

    ) {

        console.error(

            "Chat API Error:",

            error

        );

        const retryAllowed = (

            retry

            <

            MAX_RETRIES

            &&

            !error.response

            &&

            error.code

            !==

            "ECONNABORTED"

            &&

            error.code

            !==

            "ERR_CANCELED"

        );

        if (

            retryAllowed

        ) {

            await sleep(

                700

            );

            return sendMessage(

                message,

                sessionId,

                retry + 1

            );

        }

        activeController = null;

        return normalizeError(

            error

        );

    }

};


export const cancelActiveRequest = () => {

    if (

        activeController

    ) {

        activeController.abort();

        activeController = null;

    }

};