import axiosInstance from "./axiosInstance";

export const getSessions = async () => {

    const response = await axiosInstance.get(
        "/sessions"
    );

    return response.data;
};

export const getSessionHistory = async (
    sessionId
) => {

    const response = await axiosInstance.get(
        `/sessions/${sessionId}/history`
    );

    return response.data;
};

export const renameSession = async (
    sessionId,
    title
) => {

    const response = await axiosInstance.patch(

        `/sessions/${sessionId}`,

        {
            title
        }

    );

    return response.data;
};

export const deleteSession = async (
    sessionId
) => {

    const response = await axiosInstance.delete(

        `/sessions/${sessionId}`

    );

    return response.data;
};