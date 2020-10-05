import { helper } from '@ember/component/helper';
import { get } from '@ember/object';
import { assert } from '@ember/debug';
import config from '../config/environment';

export default helper(function docUrl(params/*, hash*/) {
  const baseURL = config.documentation.baseURL;
  const docKey = params[0] || '';
  const configuredPath = get(config.documentation, docKey);
  if (docKey) {
    assert(`
      Documentation for "${docKey}" could not be found. Please ensure that
      this key exists under "documentation" in your app config.
    `, configuredPath);
  }
  const path = configuredPath || '';
  return `${baseURL}${path}`;
});
