import { helper } from '@ember/component/helper';

export default helper(function formatDateIsoHuman(params /*, hash*/) {
  return params[0]
    .toISOString()
    .replace('T', ' ')
    .replace(/\.\d*Z/, '');
});
