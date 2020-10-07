import { helper } from '@ember/component/helper';
import config from '../config/environment';

export default helper(function companyName() {
  return config.companyName;
});
