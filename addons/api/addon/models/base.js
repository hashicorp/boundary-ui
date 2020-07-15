import Model from '@ember-data/model';
import { belongsTo } from '@ember-data/model';
import { computed } from '@ember/object';

export default class BaseModel extends Model {

  // =relationships

  /**
   * Scope of this resource, if any.
   * @type {ScopeModel}
   */
  @belongsTo('scope', {async: false, inverse: false}) scope;

  // =attributes

  /**
   * Names are optional on models in our API.  Thus we need to fallback on ID
   * for display purposes.
   * @type {string}
   */
  @computed('name', 'id')
  get displayName() {
    return this.name || this.id;
  }

  /**
   * @type {boolean}
   */
  @computed('hasDirtyAttributes', 'isSaving')
  get canSave() {
    return this.hasDirtyAttributes && !this.isSaving;
  }

  /**
   * @type {boolean}
   */
  @computed('canSave')
  get cannotSave() {
    return !this.canSave;
  }
}
