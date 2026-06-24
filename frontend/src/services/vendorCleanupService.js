import axiosInstance from "../api/axiosInstance";

export const getCleanupDashboard = async () => {
    const res = await axiosInstance.get("/admin/vendor-cleanup/dashboard");
    return res.data;
};

export const runAnalysis = async () => {
    const res = await axiosInstance.post("/admin/vendor-cleanup/run");
    return res.data;
};

export const getCleanupReports = async () => {
    const res = await axiosInstance.get("/admin/vendor-cleanup/reports");
    return res.data;
};

export const getAllCleanupLogs = async () => {
    const res = await axiosInstance.get("/admin/vendor-cleanup/logs");
    return res.data;
};

export const getLogsForRun = async (runId) => {
    const res = await axiosInstance.get(`/admin/vendor-cleanup/logs/${runId}`);
    return res.data;
};