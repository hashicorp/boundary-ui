import { helper } from '@ember/component/helper';
import config from '../config/environment';

export default helper(function companyCopyright() {
  const currentYear = new Date().getFullYear();
  return `© ${currentYear} ${config.companyName}`;
});
