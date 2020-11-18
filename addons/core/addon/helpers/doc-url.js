import { helper } from '@ember/component/helper';
import { assert } from '@ember/debug';
import config from 'ember-get-config';

export default helper(function docUrl(params /*, hash*/) {
  const baseURL = config.documentation.baseURL;
  const docKey = params[0] || '';
  const configuredPath = config.documentation.topics[docKey];
  if (docKey) {
    assert(
      `
      Documentation for "${docKey}" could not be found. Please ensure that
      this key exists under "documentation" in your app config.
    `,
      configuredPath
    );
  }
  const path = configuredPath || '';
  return `${baseURL}${path}`;
});
