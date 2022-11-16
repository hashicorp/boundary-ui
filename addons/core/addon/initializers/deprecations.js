import { registerDeprecationHandler } from '@ember/debug';

export function initialize() {
  registerDeprecationHandler((message, options, next) => {
    if (options?.url) {
      message += options.url;
    }
    next(message, options);
  });
}

export default {
  initialize,
};
