import { helper } from '@ember/component/helper';

export default helper(function formatDateIso(params/*, hash*/) {
  return params[0].toISOString();
});
