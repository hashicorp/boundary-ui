import Model from '@ember-data/model';
import { fragment } from 'ember-data-model-fragments/attributes';
import { computed } from '@ember/object';
import { get } from '@ember/object';

/**
 * Base model class provides common functionality for all models.
 *
 * One of the most interesting features of most resources is the
 * `scope` field, which arrives from the API as an embedded JSON fragment.
 * It contains information such as the parent scope ID and type.  This scope ID
 * is then used when generation scoped resource URLs via the
 * `adapterOptions.scopeID` option (see `save` method below).
 *
 * For convenience, developers may interact with scope in a number of ways.
 * The simplest method, when you don't care about other information, is to set
 * the `scopeID`, e.g. `record.scopeID = 'o_123'`.  The scope JSON fragment
 * may be set directly, `record.scope = { scope_id: 'o_123' }`.
 * For convenience, you may even set the scope using a `Scope` model:
 * `record.scopeModel = scopeModelInstance`, which automatically converts the
 * scope to a JSON fragment of the proper shape and assigns it to `scope`.
 *
 * A record's scope may be read in one of two ways:
 *
 *   1) As a JSON fragment:  `record.scope`,
 *   2) Or as an ID:  `record.scopeID`.
 */
export default class BaseModel extends Model {

  // =relationships

  /**
   * Scope of this resource, if any, represented as a JSON fragment.
   * @type {FragmentScope}
   */
  @fragment('fragment-scope') scope;

  // =attributes

  set scopeModel(model) {
    if (model) {
      const json = model.serialize();
      json.scope_id = model.id;
      this.scope = json;
    }
  }

  /**
   * Convenience for getting and setting the parent scope ID.
   * @type {string
   */
  @computed('scope.scope_id')
  get scopeID() {
    return get(this, 'scope.scope_id');
  }
  set scopeID(id) {
    if (!this.scope) this.scope = {};
    this.scope.scope_id = id;
  }

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
    const scopeID = this.scopeID;
    if (scopeID && !options.adapterOptions.scopeID) {
      options.adapterOptions.scopeID = scopeID;
    }
    return super.save(options);
  }

}
