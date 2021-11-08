import Helper from '@ember/component/helper';
import { getOwner } from '@ember/application';

export default class extends Helper {
  compute() {
    const config = getOwner(this).resolveRegistration('config:environment');
    const currentYear = new Date().getFullYear();
    return `© ${currentYear} ${config.companyName}`;
  }
}
