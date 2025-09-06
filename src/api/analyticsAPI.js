import baseURL from './baseURL';

const analyticsAPI = {
  logVisit: `${baseURL}/analytics/log/`,   // POST log a visit
  pageStats: `${baseURL}/analytics/stats/` // GET site/page stats
};

export default analyticsAPI;
