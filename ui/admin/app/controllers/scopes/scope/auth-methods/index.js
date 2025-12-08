/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Controller from '@ember/controller';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { loading } from 'ember-loading';
import { confirm } from 'core/decorators/confirm';
import { notifySuccess, notifyError } from 'core/decorators/notify';
import { tracked } from '@glimmer/tracking';
import { TYPES_AUTH_METHOD } from 'api/models/auth-method';

export default class ScopesScopeAuthMethodsIndexController extends Controller {
  // =services

  @service router;
  @service abilities;
  @service intl;
  @service store;

  // =attributes

  queryParams = [
    'search',
    { types: { type: 'array' } },
    { primary: { type: 'array' } },
    'page',
    'pageSize',
    'sortAttribute',
    'sortDirection',
  ];

  @tracked search;
  @tracked types = [];
  @tracked primary = [];
  @tracked page = 1;
  @tracked pageSize = 10;
  @tracked sortAttribute;
  @tracked sortDirection;

  /**
   * True if the current scope has a primary auth method set.
   * @type {boolean}
   */
  get hasPrimaryAuthMethod() {
    return Boolean(this.scopeModel.primary_auth_method_id);
  }

  get primaryOptions() {
    return [
      { id: 'true', name: this.intl.t('actions.yes') },
      { id: 'false', name: this.intl.t('actions.no') },
    ];
  }

  get authMethodTypeOptions() {
    return TYPES_AUTH_METHOD.map((type) => ({
      id: type,
      name: this.intl.t(`resources.auth-method.types.${type}`),
    }));
  }

  get filters() {
    return {
      allFilters: {
        primary: this.primaryOptions,
        types: this.authMethodTypeOptions,
      },
      selectedFilters: {
        primary: this.primary,
        types: this.types,
      },
    };
  }

  /**
   * If can list (at least): return default welcome message.
   * If can create (only): return create-but-not-list welcome message.
   * If can neither list nor create: return neither-list-nor-create welcome message
   * @type {string}
   */
  get messageDescription() {
    const canList = this.abilities.can('list model', this.scopeModel, {
      collection: 'auth-methods',
    });
    const canCreate = this.abilities.can('create model', this.scopeModel, {
      collection: 'auth-methods',
    });
    const resource = this.intl.t('resources.auth-method.title_plural');
    let description = 'descriptions.neither-list-nor-create';

    if (canList) {
      description = 'resources.auth-method.description';
    } else if (canCreate) {
      description = 'descriptions.create-but-not-list';
    }

    return this.intl.t(description, { resource });
  }

  // =actions

  /**
   * Handles input on each keystroke and the search queryParam
   * @param {object} event
   */
  @action
  handleSearchInput(event) {
    const { value } = event.target;
    this.search = value;
    this.page = 1;
  }

  /**
   * Sets a query param to the value of selectedItems
   * and resets the page to 1.
   * @param {string} paramKey
   * @param {[string]} selectedItems
   */
  @action
  applyFilter(paramKey, selectedItems) {
    this[paramKey] = [...selectedItems];
    this.page = 1;
  }

  /**
   * Rollback changes to an auth-method.
   * @param {AuthMethodModel} authMethod
   */
  @action
  cancel(authMethod) {
    const { isNew } = authMethod;
    authMethod.rollbackAttributes();
    if (isNew) this.router.transitionTo('scopes.scope.auth-methods');
  }

  /**
   * Save an auth-method in current scope.
   * @param {AuthMethodModel} authMethod
   */
  @action
  @loading
  @notifyError(({ message }) => message)
  @notifySuccess(({ isNew }) =>
    isNew ? 'notifications.create-success' : 'notifications.save-success',
  )
  async save(authMethod) {
    await authMethod.save();
    if (this.abilities.can('read model', authMethod)) {
      await this.router.transitionTo(
        'scopes.scope.auth-methods.auth-method',
        authMethod,
      );
    } else {
      this.router.transitionTo('scopes.scope.auth-methods');
    }
    await this.router.refresh();
  }

  /**
   * Delete an auth method in current scope and redirect to index
   * @param {AuthMethodModel} authMethod
   */
  @action
  @loading
  @confirm('questions.delete-confirm')
  @notifyError(({ message }) => message, { catch: true })
  @notifySuccess('notifications.delete-success')
  async delete(authMethod) {
    const scopeID = authMethod.scopeID;
    await authMethod.destroyRecord();
    // Reload the scope, since this is where the primary_auth_method_id is
    // stored.  An auth method deletion could affect this field.
    await this.store.findRecord('scope', scopeID, { reload: true });
    this.router.replaceWith('scopes.scope.auth-methods');
    await this.router.refresh();
  }

  /**
   * Elects the specified auth method to primary for the current scope.
   * @param {AuthMethodModel} authMethod
   * @param {string} authMethod.id
   */
  @action
  @loading
  @confirm('resources.auth-method.questions.make-primary-confirm', {
    title: 'resources.auth-method.questions.make-primary',
  })
  @notifyError(({ message }) => message, { catch: true })
  @notifySuccess('resources.auth-method.notifications.make-primary-success')
  async makePrimary(authMethod) {
    const scope = this.store.peekRecord('scope', authMethod.scopeID);
    scope.primary_auth_method_id = authMethod.id;
    // Attempt to save the change to the scope.  If this operation fails,
    // we rollback the change and rethrow the error so the user can be notified.
    try {
      await scope.save();
    } catch (e) {
      scope.rollbackAttributes();
      throw e;
    }
    await this.router.refresh();
  }

  /**
   * Sets the `primary_auth_method_id` field to null for the current scope
   * and saves it if and only if the specified auth method is in fact primary
   * for the current scope.
   * @param {AuthMethodModel} authMethod
   */
  @action
  @loading
  @confirm('resources.auth-method.questions.remove-as-primary-confirm', {
    title: 'resources.auth-method.questions.remove-as-primary',
  })
  @notifyError(({ message }) => message, { catch: true })
  @notifySuccess(
    'resources.auth-method.notifications.remove-as-primary-success',
  )
  async removeAsPrimary(authMethod) {
    const scope = this.store.peekRecord('scope', authMethod.scopeID);
    scope.primary_auth_method_id = null;
    // Attempt to save the change to the scope.  If this operation fails,
    // we rollback the change and rethrow the error so the user can be notified.
    try {
      await scope.save();
    } catch (e) {
      scope.rollbackAttributes();
      throw e;
    }
    await authMethod.reload();
  }

  /**
   * Removes an item from array `property` at `index` on the
   * passed `authMethod`.  This is used to manage entries in fragment array
   * fields such as `signing_algorithms`.
   * @param {AuthMethodModel} authMethod
   * @param {string} property
   * @param {number} index
   */
  @action
  removeItemByIndex(authMethod, property, index) {
    const array = authMethod.get(property).filter((item, i) => i !== index);
    authMethod.set(property, array);
  }

  /**
   * Adds a string item to array `property` on the passed `authMethod`.
   * This is used to manage entries in fragment OIDC string array fields such
   * as `signing_algorithms`.
   * @param {AuthMethodModel} authMethod
   * @param {string} property
   * @param {string} value
   */
  @action
  addStringItem(authMethod, property, value) {
    const existingArray = authMethod[property] ?? [];
    const array = [...existingArray, { value }];
    authMethod.set(property, array);
  }

  /**
   * Adds an account map fragment to the passed `authMethod`.
   * @param {AuthMethodModel} authMethod
   * @param {string} field
   * @param {string} from
   * @param {string} to
   */
  @action
  addAccountMapItem(authMethod, field, from, to) {
    const existingArray = authMethod[field] ?? [];
    const array = [...existingArray, { from, to }];
    authMethod.set(field, array);
  }

  /**
   * Copies the contents of string array fields in order to force the instance
   * into a dirty state.  This ensures that `model.rollbackAttributes()` reverts
   * to the original expected array.
   *
   * The deep copy implemented here is required to ensure that both the
   * array itself and its members are all new.
   *
   * @param {authMethodModel} authMethod
   */
  @action
  edit(authMethod) {
    if (authMethod.claims_scopes) {
      authMethod.claims_scopes = structuredClone(authMethod.claims_scopes);
    }
    if (authMethod.signing_algorithms) {
      authMethod.signing_algorithms = structuredClone(
        authMethod.signing_algorithms,
      );
    }
    if (authMethod.allowed_audiences) {
      authMethod.allowed_audiences = structuredClone(
        authMethod.allowed_audiences,
      );
    }
    if (authMethod.idp_ca_certs) {
      authMethod.idp_ca_certs = structuredClone(authMethod.idp_ca_certs);
    }
    if (authMethod.account_claim_maps) {
      authMethod.account_claim_maps = structuredClone(
        authMethod.account_claim_maps,
      );
    }
    if (authMethod.certificates) {
      authMethod.certificates = structuredClone(authMethod.certificates);
    }
    if (authMethod.account_attribute_maps) {
      authMethod.account_attribute_maps = structuredClone(
        authMethod.account_attribute_maps,
      );
    }
  }

  /**
   * Update state of OIDC or LDAP auth method
   * @param {string} state
   * @param {authMethodModel} authMethod
   */
  @action
  @notifyError(({ message }) => message)
  @notifySuccess('notifications.save-success')
  async changeState(authMethod, state) {
    await authMethod.changeState(state);
  }

  /**
   * Set sort values and sets page to 1
   * @param {string} sortBy
   * @param {string} sortOrder
   */
  @action
  onSort(sortBy, sortOrder) {
    this.sortAttribute = sortBy;
    this.sortDirection = sortOrder;
    this.page = 1;
  }
}
