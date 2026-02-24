/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import GeneratedTargetModel from '../generated/models/target';
import { attr } from '@ember-data/model';
import { service } from '@ember/service';

export const TYPE_TARGET_TCP = 'tcp';
export const TYPE_TARGET_SSH = 'ssh';
export const TYPE_TARGET_RDP = 'rdp';

export const TYPES_TARGET = Object.freeze([
  TYPE_TARGET_TCP,
  TYPE_TARGET_SSH,
  TYPE_TARGET_RDP,
]);

export default class TargetModel extends GeneratedTargetModel {
  // =services

  @service store;

  // =attributes

  /**
   * @type Array
   */
  @attr('host-source-id-array', {
    readOnly: true,
    emptyArrayIfMissing: true,
  })
  host_sources;

  /**
   * Brokered Credential source ids are read only and can be
   * persisted via a dedicated call to `addBrokeredCredentialSources()`.
   */
  @attr('string-array', {
    readOnly: true,
    emptyArrayIfMissing: true,
  })
  brokered_credential_source_ids;

  /**
   * Injected Application Credential source ids are read only and can be
   * persisted via a dedicated call to `addInjectedApplicationCredentialSources()`.
   */
  @attr('string-array', {
    readOnly: true,
    emptyArrayIfMissing: true,
  })
  injected_application_credential_source_ids;

  /**
   * An array of resolved host set and host catalog instances.  Model instances
   * must already be loaded into the store (this method will not load unloaded
   * instances).  Unresolvable instances are excluded from the array.
   * @type {[{model: HostSetModel, hostCatalog: HostCatalogModel}]}
   */
  get hostSets() {
    return this.host_sources
      .map(({ host_source_id, host_catalog_id }) => ({
        model: this.store.peekRecord('host-set', host_source_id),
        hostCatalog: this.store.peekRecord('host-catalog', host_catalog_id),
      }))
      .filter((hostSetRef) => hostSetRef.model !== null);
  }

  /**
   * An array of resolved credential library and credential instances.  Model instances
   * must already be loaded into the store (this method will not load unloaded
   * instances).  Unresolvable instances are excluded from the array.
   * @type {[CredentialLibraryModel, CredentialModel]}
   */
  get brokeredCredentialSources() {
    return this.brokered_credential_source_ids
      .map((source) => {
        if (source.value.startsWith('cred')) {
          return this.store.peekRecord('credential', source.value);
        } else {
          return this.store.peekRecord('credential-library', source.value);
        }
      })
      .filter(Boolean);
  }

  /**
   * An array of resolved credential library and credential instances.  Model instances
   * must already be loaded into the store (this method will not load unloaded
   * instances).  Unresolvable instances are excluded from the array.
   * @type {[CredentialLibraryModel, CredentialModel]}
   */
  get injectedApplicationCredentialSources() {
    return this.injected_application_credential_source_ids
      .map((source) => {
        if (source.value.startsWith('cred')) {
          return this.store.peekRecord('credential', source.value);
        } else {
          return this.store.peekRecord('credential-library', source.value);
        }
      })
      .filter(Boolean);
  }

  /**
   * Sessions associated with this target (but only already loaded sessions).
   * @type {SessionModel[]}
   */
  get sessions() {
    return this.store
      .peekAll('session')
      .filter((s) => s && s.target_id === this.id);
  }

  /**
   * Available sessions associated with this target (but only already loaded sessions).
   * @type {SessionModel[]}
   */
  get availableSessions() {
    return this.sessions.filter((session) => session.isAvailable);
  }

  /**
   * The project associated with this target (if already loaded).
   * @type {ScopeModel}
   */
  get project() {
    return this.store.peekRecord('scope', this.scopeID);
  }

  /**
   * True if any sessions associated with this target are active or pending.
   * @type {boolean}
   */
  get isActive() {
    const pendingOrActiveSessions = this.sessions.filter(
      (s) => s.isActive || s.isPending,
    );
    return Boolean(pendingOrActiveSessions.length);
  }

  get associatedAliases() {
    return this.store
      .peekAll('alias')
      .filter((alias) => alias?.destination_id === this.id);
  }

  // =methods

  /**
   * Adds host sets via the `add-host-sources` method.
   * See serializer and adapter for more information.
   * @param {[string]} hostSetIDs
   * @param {object} options
   * @param {object} options.adapterOptions
   * @return {Promise}
   */
  addHostSources(hostSetIDs, options = { adapterOptions: {} }) {
    const defaultAdapterOptions = {
      method: 'add-host-sources',
      hostSetIDs,
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
   * Delete host sets via the `remove-host-sources` method.
   * See serializer and adapter for more information.
   * @param {[string]} hostSetIDs
   * @param {object} options
   * @param {object} options.adapterOptions
   * @return {Promise}
   */
  removeHostSources(hostSetIDs, options = { adapterOptions: {} }) {
    const defaultAdapterOptions = {
      method: 'remove-host-sources',
      hostSetIDs,
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
   * Delete a single host set via the `remove-host-sources` method.
   * @param {number} hostSetID
   * @param {object} options
   * @return {Promise}
   */
  removeHostSource(hostSetID, options) {
    return this.removeHostSources([hostSetID], options);
  }

  /**
   * Adds credential sources via the `add-credential-sources` method.
   * See serializer and adapter for more information.
   * @param {[string]} brokeredCredentialSourceIDs
   * @param {object} options
   * @param {object} options.adapterOptions
   * @return {Promise}
   */
  addBrokeredCredentialSources(
    brokeredCredentialSourceIDs,
    options = { adapterOptions: {} },
  ) {
    const defaultAdapterOptions = {
      method: 'add-credential-sources',
      brokeredCredentialSourceIDs,
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
   * Adds credential sources via the `add-credential-sources` method.
   * See serializer and adapter for more information.
   * @param {[string]} injectedApplicationCredentialSourceIDs
   * @param {object} options
   * @param {object} options.adapterOptions
   * @return {Promise}
   */
  addInjectedApplicationCredentialSources(
    injectedApplicationCredentialSourceIDs,
    options = { adapterOptions: {} },
  ) {
    const defaultAdapterOptions = {
      method: 'add-credential-sources',
      injectedApplicationCredentialSourceIDs,
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
   * Delete credential libraries and credentials via the `remove-credential-sources` method.
   * See serializer and adapter for more information.
   * @param {[string]} brokeredCredentialSourceIDs
   * @param {object} options
   * @param {object} options.adapterOptions
   * @return {Promise}
   */
  removeBrokeredCredentialSources(
    brokeredCredentialSourceIDs,
    options = { adapterOptions: {} },
  ) {
    const defaultAdapterOptions = {
      method: 'remove-credential-sources',
      brokeredCredentialSourceIDs,
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
   * Delete a single credential library/credential set via the `remove-credential-sources` method.
   * @param {number} brokeredCredentialSourceID
   * @param {object} options
   * @return {Promise}
   */
  removeBrokeredCredentialSource(brokeredCredentialSourceID, options) {
    return this.removeBrokeredCredentialSources(
      [brokeredCredentialSourceID],
      options,
    );
  }

  /**
   * Delete credential libraries and credentials via the `remove-credential-sources` method.
   * See serializer and adapter for more information.
   * @param {[string]} injectedApplicationCredentialSourceIDs
   * @param {object} options
   * @param {object} options.adapterOptions
   * @return {Promise}
   */
  removeInjectedApplicationCredentialSources(
    injectedApplicationCredentialSourceIDs,
    options = { adapterOptions: {} },
  ) {
    const defaultAdapterOptions = {
      method: 'remove-credential-sources',
      injectedApplicationCredentialSourceIDs,
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
   * Delete a single credential library/credential set via the `remove-credential-sources` method.
   * @param {number} injectedApplicationCredentialSourceID
   * @param {object} options
   * @return {Promise}
   */
  removeInjectedApplicationCredentialSource(
    injectedApplicationCredentialSourceID,
    options,
  ) {
    return this.removeInjectedApplicationCredentialSources(
      [injectedApplicationCredentialSourceID],
      options,
    );
  }

  /**
   * True if the target type is tcp.
   * @type {boolean}
   */
  get isTCP() {
    return this.type === TYPE_TARGET_TCP;
  }

  /**
   * True if the target type is ssh.
   * @type {boolean}
   */
  get isSSH() {
    return this.type === TYPE_TARGET_SSH;
  }

  /**
   * True if the target type is rdp.
   * @type {boolean}
   */
  get isRDP() {
    return this.type === TYPE_TARGET_RDP;
  }
}
