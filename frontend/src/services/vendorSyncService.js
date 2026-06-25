import axiosInstance from "../api/axiosInstance";

export const getSyncDashboard = async () => {
    const res = await axiosInstance.get("/admin/vendor-sync/dashboard");
    return res.data;
};

export const runSync = async () => {
    const res = await axiosInstance.post("/admin/vendor-sync/run");
    return res.data;
};

export const getSyncRuns = async () => {
    const res = await axiosInstance.get("/admin/vendor-sync/runs");
    return res.data;
};

export const getSyncLogs = async () => {
    const res = await axiosInstance.get("/admin/vendor-sync/logs");
    return res.data;
};