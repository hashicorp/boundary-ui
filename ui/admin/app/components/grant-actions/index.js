/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Component from '@glimmer/component';
import { service } from '@ember/service';

export default class GrantActionsComponent extends Component {
  // =services

  @service intl;

  // =attributes

  /**
   * Returns all available resource type names.
   * @returns {string[]}
   */
  get resourceTypeNames() {
    if (!this.args.grantsSchema?.resource_types) return [];
    return this.args.grantsSchema.resource_types.map((rt) => rt.type);
  }

  /**
   * Returns true if there are no grants schema available.
   * @type {boolean}
   */
  get isGrantsSchemaUnavailable() {
    return this.resourceTypeNames.length === 0;
  }

  /**
   * The resource type from the grant schema matching the given type.
   * @type {object}
   */
  get resourceType() {
    return this.args.grantsSchema?.resource_types?.find(
      (rt) => rt.type === this.args.currentResourceType,
    );
  }

  /**
   * Maps collection actions to objects with name and translated description.
   * @type {Array<{name: string, description: string}>}
   */
  get collectionActions() {
    if (!this.resourceType?.collection_actions) return [];
    return this.resourceType.collection_actions.map((action) => ({
      name: action,
      description: this.#getActionDescription(action),
    }));
  }

  /**
   * Maps ID actions to objects with name and translated description.
   * @type {Array<{name: string, description: string}>}
   */
  get idActions() {
    if (!this.resourceType?.id_actions) return [];
    return this.resourceType.id_actions.map((action) => ({
      name: action,
      description: this.#getActionDescription(action),
    }));
  }

  /**
   * Combined list of collection and ID actions.
   * @type {Array<{name: string, description: string}>}
   */
  get allActions() {
    return [...this.collectionActions, ...this.idActions];
  }

  // =private methods

  /**
   * The set of action keys that use the resource type in their description.
   * @type {Set<string>}
   */
  #resourceTypeActions = new Set([
    'create',
    'list',
    'read',
    'update',
    'delete',
    'read:self',
    'delete:self',
    'cancel',
    'cancel:self',
  ]);

  /**
   * Returns the translated description for a given action name.
   * For CRUD and :self actions, use the resource type name.
   * Falls back to the action name if no translation is found.
   * @param {string} action
   * @returns {string}
   */
  #getActionDescription(action) {
    const key = `resources.role.edit-grants.actions.${action}`;
    if (this.intl.exists(key)) {
      if (this.#resourceTypeActions.has(action)) {
        return this.intl.t(key, {
          resourceType: this.args.currentResourceType,
        });
      }
      return this.intl.t(key);
    }
    return action;
  }
}
