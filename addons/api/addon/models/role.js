import GeneratedRoleModel from '../generated/models/role';
import { fragmentArray } from 'ember-data-model-fragments/attributes';

export default class RoleModel extends GeneratedRoleModel {

  // =attributes

  /**
   * Principals are users and groups assigned to a role.  They are represented
   * as references to User and Group instances.  Since Ember Data relationships
   * are wanting, we do not model these as a polymorphic relationship as might
   * see obvious.  Instead, the application layer is expected to load referenced
   * users and groups as needed.
   */
  @fragmentArray('fragment-principal', {
    readOnly: true,
    emptyArrayIfMissing: true
  }) principals;

  /**
   * Grants is read-only _most_ under normal circumstances.  But grants can
   * be persisted via a dedicated call to `saveGrants()`.
   */
  @fragmentArray('fragment-string', {readOnly: true}) grants;

  // =methods

  /**
   * Saves the `grants` array on the role via the `set-grants` method.
   * See serializer and adapter for more information.
   * @return {Promise}
   */
  saveGrants() {
    return this.save({
      adapterOptions: {
        method: 'set-grants',
        serializeGrants: true
      }
    });
  }

  /**
   * Adds principals via the `add-principals` method.
   * See serializer and adapter for more information.
   * @param {[string]} principalIDs
   * @param {object} options
   * @param {object} options.adapterOptions
   * @return {Promise}
   */
  addPrincipals(principalIDs, options={ adapterOptions: {} }) {
    const defaultAdapterOptions = {
      method: 'add-principals',
      principalIDs
    };
    // There is no "deep merge" in ES.
    // All of this nonsense is here to ensure we get
    // a decent merge of `adapterOptions`.
    return this.save({
      ...options,
      adapterOptions: {
        ...defaultAdapterOptions,
        ...options.adapterOptions
      }
    });
  }

  /**
   * Delete principals via the `remove-principals` method.
   * See serializer and adapter for more information.
   * @param {[string]} principalIDs
   * @param {object} options
   * @param {object} options.adapterOptions
   * @return {Promise}
   */
  removePrincipals(principalIDs, options={ adapterOptions: {} }) {
    const defaultAdapterOptions = {
      method: 'remove-principals',
      principalIDs
    };
    // There is no "deep merge" in ES.
    // All of this nonsense is here to ensure we get
    // a decent merge of `adapterOptions`.
    return this.save({
      ...options,
      adapterOptions: {
        ...defaultAdapterOptions,
        ...options.adapterOptions
      }
    });
  }

  /**
   * Delete a single principal via the `remove-principals` method.
   * @param {number} principalIDs
   * @param {object} options
   * @return {Promise}
   */
  removePrincipal(principalID, options) {
    return this.removePrincipals([principalID], options);
  }

}
