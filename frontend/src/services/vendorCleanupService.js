import axiosInstance from "../api/axiosInstance";

// ── Dashboard ──────────────────────────────────────────────────────────

export const getCleanupDashboard = async () => {
    const res = await axiosInstance.get("/admin/vendor-cleanup/dashboard");
    return res.data;
};

// ── Run Analysis ───────────────────────────────────────────────────────

export const runAnalysis = async () => {
    const res = await axiosInstance.post("/admin/vendor-cleanup/run");
    return res.data;
};

// ── Reports ────────────────────────────────────────────────────────────

export const getCleanupReports = async () => {
    const res = await axiosInstance.get("/admin/vendor-cleanup/reports");
    return res.data;
};

export const deleteRun = async (runId) => {
    const res = await axiosInstance.delete(`/admin/vendor-cleanup/reports/${runId}`);
    return res.data;
};

// ── Logs ───────────────────────────────────────────────────────────────

export const getAllCleanupLogs = async () => {
    const res = await axiosInstance.get("/admin/vendor-cleanup/logs");
    return res.data;
};

export const getLogsForRun = async (runId) => {
    const res = await axiosInstance.get(`/admin/vendor-cleanup/logs/${runId}`);
    return res.data;
};

// ── Log Status ─────────────────────────────────────────────────────────

export const updateLogStatus = async (logId, status) => {
    const res = await axiosInstance.patch(
        `/admin/vendor-cleanup/logs/${logId}/status`,
        { status }
    );
    return res.data;
};