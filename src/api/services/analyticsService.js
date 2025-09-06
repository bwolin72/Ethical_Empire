import publicAxios from '../publicAxios';
import axiosInstance from '../axiosInstance';
// If you have ../analyticsAPI, use it. Otherwise, we inline the paths from your endpoints file.

const PATHS = {
  stats: '/analytics/stats/',  // GET
  log: '/analytics/log/',      // usually POST to record a visit
};

const analyticsService = {
  stats: () => axiosInstance.get(PATHS.stats),
  logVisit: (payload = {}) => publicAxios.post(PATHS.log, payload),

  // 🔁 Dashboard compatibility alias
  site: () => axiosInstance.get(PATHS.stats),
};

export default analyticsService;
