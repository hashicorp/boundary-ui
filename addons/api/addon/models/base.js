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

  // =methods

  /**
   * If this model instance has a related scope, the scope's ID will be passed
   * via `adapterOptions.scopeID` automatically.  End users may optionally
   * pass a custom scope ID to override.
   *
   * @example
   *   model.save(); // passes the model's current scope ID
   *   model.save({adapterOptions: {scopeID: 'global'}}); // override scope ID
   *
   * End users may specify a _custom method_ via `adapterOptions.method`.
   * Custom methods are appended to the record's URL by the adapter.
   *
   * @example
   *   // Results in a URL: `/v1/model-name/id:my-custom-method`
   *   model.save({adapterOptions: {method: 'my-custom-method'}});
   *
   * @return {Promise}
   */
  save(options={adapterOptions: {}}) {
    const scopeID = this.belongsTo('scope').id();
    if (scopeID && !options.adapterOptions.scopeID) {
      options.adapterOptions.scopeID = scopeID;
    }
    return super.save(options);
  }

}
