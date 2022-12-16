import GeneratedRoleModel from '../generated/models/role';
import { attr } from '@ember-data/model';
import { inject as service } from '@ember/service';
import { resolve, all } from 'rsvp';

export default class RoleModel extends GeneratedRoleModel {
  // =services

  @service store;
  @service resourceFilterStore;

  // =attributes

  /**
   * Principals are users, groups and managed groups assigned to a role.  They are represented
   * as references to User, Group and Managed Group instances.  Since Ember Data relationships
   * are wanting, we do not model these as a polymorphic relationship as might
   * see obvious.  Instead, the application layer is expected to load referenced
   * users, groups and managed groups as needed.
   */
  @attr('principal-array', {
    readOnly: true,
    emptyArrayIfMissing: true,
  })
  principals;

  /**
   * Grant strings are read-only.  But grants can be persisted via a dedicated
   * call to `saveGrantStrings(grants)`.
   */
  @attr({ readOnly: true, emptyArrayIfMissing: true }) grant_strings;

  /**
   * Convenience for looking up the grant scope, if loaded.
   */
  get grantScope() {
    return this.grant_scope_id
      ? this.store.peekRecord('scope', this.grant_scope_id)
      : null;
  }

  /**
   * A list of IDs for principals of type `user`.
   * @type {string[]}
   */
  get userIDs() {
    return this.principals
      .filter(({ type }) => type === 'user')
      .map(({ principal_id }) => principal_id);
  }

  /**
   * A list of IDs for principals of type `group`.
   * @type {string[]}
   */
  get groupIDs() {
    return this.principals
      .filter(({ type }) => type === 'group')
      .map(({ principal_id }) => principal_id);
  }

  /**
   * A list of IDs for principals of type `group`.
   * @type {string[]}
   */
  get managedGroupIDs() {
    return this.principals
      .filter(({ type }) => type === 'managed group')
      .map(({ principal_id }) => principal_id);
  }

  /**
   * A promise that resolves to an array of User instances.
   * When calling this getter, be sure to await resolution
   * before interacting with the results.
   * @type {Promise[UserModel]}
   */
  get users() {
    const ids = this.userIDs;

    // Role has prinicipal IDs,
    // return a promise which resolves model instances for those IDs
    if (ids?.length) {
      return this.resourceFilterStore
        .queryBy('user', { id: ids }, { scope_id: 'global', recursive: true })
        .then((models) => models.map((model) => model));
    }
    //this.store.query('user', { scope_id: 'global', recursive: true });
    // No principal IDs,
    // return a promise resolving to an empty array
    return resolve([]);
  }

  /**
   * A promise that resolves to an array of Group instances.
   * When calling this getter, be sure to await resolution
   * before interacting with the results.
   * @type {Promise[GroupModel]}
   */
  get groups() {
    const ids = this.groupIDs;

    // Role has prinicipal IDs,
    // return a promise which resolves model instances for those IDs
    if (ids?.length) {
      return this.resourceFilterStore
        .queryBy('group', { id: ids }, { scope_id: 'global', recursive: true })
        .then((models) => models.map((model) => model));
    }

    // No principal IDs,
    // return a promise resolving to an empty array
    return resolve([]);
  }

  /**
   * A promise that resolves to an array of Group instances.
   * When calling this getter, be sure to await resolution
   * before interacting with the results.
   * @type {Promise[GroupModel]}
   */
  get managedGroups() {
    const ids = this.managedGroupIDs;
    // Role has prinicipal IDs,
    // return a promise which resolves model instances for those IDs
    if (ids?.length) {
      const authMethodIDs = this.resourceFilterStore
        .queryBy(
          'auth-method',
          { type: 'oidc' },
          { scope_id: 'global', recursive: true }
        )
        .then((models) => models.map(({ id }) => id));
      const managedGroupsByAuthMethod = authMethodIDs.then((authMethodIds) =>
        all(
          authMethodIds.map((auth_method_id) =>
            this.resourceFilterStore
              .queryBy('managed-group', { id: ids }, { auth_method_id })
              .then((models) => models.map((model) => model))
          )
        )
      );
      const managedGroups = managedGroupsByAuthMethod.then((groups) =>
        groups.flat()
      );
      return managedGroups;
    }
    // No principal IDs,
    // return a promise resolving to an empty array
    return resolve([]);
  }

  // =methods

  /**
   * Saves grant strings on the role via the `set-grants` method.
   * See serializer and adapter for more information.
   * @param {[string]} grantStrings
   * @return {Promise}
   */
  saveGrantStrings(grantStrings) {
    return this.save({
      adapterOptions: {
        method: 'set-grants',
        grantStrings,
      },
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
  addPrincipals(principalIDs, options = { adapterOptions: {} }) {
    const defaultAdapterOptions = {
      method: 'add-principals',
      principalIDs,
    };
    // There is no "deep merge" in ES.
    return this.save({
      ...options,
      adapterOptions: {
        ...defaultAdapterOptions,
        ...options.adapterOptions,
      },
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
  removePrincipals(principalIDs, options = { adapterOptions: {} }) {
    const defaultAdapterOptions = {
      method: 'remove-principals',
      principalIDs,
    };
    // There is no "deep merge" in ES.
    return this.save({
      ...options,
      adapterOptions: {
        ...defaultAdapterOptions,
        ...options.adapterOptions,
      },
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
