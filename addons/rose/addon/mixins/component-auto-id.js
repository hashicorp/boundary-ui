import Mixin from '@ember/object/mixin';
import { v1 } from 'ember-uuid';

/**
 * Add this mixin to components for an auto-generated ID.
 */
export default Mixin.create({
  /**
   * Generates an ID for this component and assigns it to `this.id`.
   */
  init() {
    this.id = `component-${v1()}`;
    return this._super(...arguments);
  },
});
