import baseURL from './baseURL';

const analyticsAPI = {
  logVisit: `${baseURL}/api/analytics/log/`,   // POST log a visit
  pageStats: `${baseURL}/api/analytics/stats/` // GET site/page stats
};

export default analyticsAPI;
