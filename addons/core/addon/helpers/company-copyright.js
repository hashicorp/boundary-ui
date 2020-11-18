import { helper } from '@ember/component/helper';
import config from 'ember-get-config';

export default helper(function companyCopyright() {
  const currentYear = new Date().getFullYear();
  return `© ${currentYear} ${config.companyName}`;
});
