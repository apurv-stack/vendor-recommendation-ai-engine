import axiosInstance from "../api/axiosInstance";

export const getAllAgents = async () => {
    const response = await axiosInstance.get("/admin/agents");
    return response.data;
};

export const getAgentById = async (agentId) => {
    const response = await axiosInstance.get(`/admin/agents/${agentId}`);
    return response.data;
};

export const toggleAgentStatus = async (agentId, status) => {
    const response = await axiosInstance.patch(`/admin/agents/${agentId}/status`, { status });
    return response.data;
};

export const getAgentPrompt = async (agentId) => {
    const response = await axiosInstance.get(`/admin/agents/${agentId}/prompt`);
    return response.data;
};

export const updateAgentPrompt = async (agentId, payload) => {
    const response = await axiosInstance.put(`/admin/agents/${agentId}/prompt`, payload);
    return response.data;
};

export const getAgentConfiguration = async (agentId) => {
    const response = await axiosInstance.get(`/admin/agents/${agentId}/config`);
    return response.data;
};

export const updateAgentConfiguration = async (agentId, payload) => {
    const response = await axiosInstance.put(`/admin/agents/${agentId}/config`, payload);
    return response.data;
};

export const getVersionHistory = async (agentId) => {
    const response = await axiosInstance.get(`/admin/agents/${agentId}/versions`);
    return response.data;
};

export const rollbackPrompt = async (agentId, versionId) => {
    const response = await axiosInstance.post(`/admin/agents/${agentId}/rollback/${versionId}`);
    return response.data;
};

export const getAuditLogs = async (agentId) => {
    const response = await axiosInstance.get(`/admin/agents/${agentId}/audit-logs`);
    return response.data;
};

export const testAgent = async (agentId, testQuery, context = "") => {
    const response = await axiosInstance.post(
        "/admin/agents/test",
        {
            agent_id: agentId,
            test_query: testQuery,
            context
        },
        {
            timeout: 180000
        }
    );

    return response.data;
};

export const testAgentWorkflow = async (query) => {
    const res = await axiosInstance.post("/admin/agents/test-workflow", {
        test_query: query
    });
    return res.data;
};