import { registerDeprecationHandler } from '@ember/debug';
import config from 'ember-get-config';

const isTesting = config.environment === 'test';

export function initialize(/* application */) {
  if (isTesting) {
    // Disable all deprecations for now in tests.
    registerDeprecationHandler((/*message, options, next*/) => {
      return;
    });
  }
}

export default {
  initialize,
};
