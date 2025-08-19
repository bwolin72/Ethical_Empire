import publicAxios from '../publicAxios';
import API from '../api';

const miscService = {
  getSettings: () => publicAxios.get(API.misc.settings),
  getFaq: () => publicAxios.get(API.misc.faq),
  getTerms: () => publicAxios.get(API.misc.terms),
  getPrivacy: () => publicAxios.get(API.misc.privacy),
};

export default miscService;
