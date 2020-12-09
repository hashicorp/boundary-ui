import { getOwner } from '@ember/application';

export function initialize(registry) {

  // Lookup the application route
  const ApplicationRoute = registry.resolveRegistration
    ? registry.resolveRegistration('route:application')
    : registry.resolve('route:application');

  ApplicationRoute.reopen({
    init() {
      this._super(...arguments);
      const originalBeforeModel = this.beforeModel;

      // Override the beforeModel hook and initialize the origin
      this.beforeModel = async function() {
        const origin = getOwner(this).lookup('service:origin');
        return origin.updateOrigin().then(
          () => originalBeforeModel.apply(this, arguments),
          () => originalBeforeModel.apply(this, arguments)
        );
      };
    },
  });
}

export default {
  after: 'ember-simple-auth',
  initialize
};
