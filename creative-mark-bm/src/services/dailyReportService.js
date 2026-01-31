import api from "./api";

export const createDailyReport = async (payload) => {
  const { data } = await api.post("/daily-reports", payload);
  return data;
};

export const getMyDailyReports = async (params = {}) => {
  const { data } = await api.get("/daily-reports/me", { params });
  return data;
};

export const adminListDailyReports = async (params = {}) => {
  const { data } = await api.get("/daily-reports", { params });
  return data;
};


