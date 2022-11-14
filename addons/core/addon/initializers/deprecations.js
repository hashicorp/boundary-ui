import { registerDeprecationHandler } from '@ember/debug';

export function initialize() {
  registerDeprecationHandler((message, options, next) => {
    next(message, options);
  });
}

export default {
  initialize,
};
