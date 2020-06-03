import Mixin from '@ember/object/mixin';

/**
 * Add mixin to a route and specify a `breadCrumb` property to
 * enable breadcrumbs for the route.
 * @see https://github.com/chrisfarber/ember-breadcrumbs
 * @example:  TODO
 */
export default Mixin.create({

  // =methods

  /**
   * Applies the specified bread crumb text to the route's controller, which
   * is where ember-breadcrumbs looks for it.  However, we don't want to be
   * required to create a bunch of otherwise unused controllers for this one
   * property.
   */
  setupController(controller) {
    if (super.setupController) super.setupController(...arguments);
    controller.set('breadCrumb', this.breadCrumb);
  }

});
