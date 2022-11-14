import { registerDeprecationHandler } from '@ember/debug';

export function initialize() {
  registerDeprecationHandler((message) => {
    console.warn(message);
    return;
  });
}

export default {
  initialize,
};
