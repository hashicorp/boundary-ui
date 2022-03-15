import GeneratedTargetModel from '../generated/models/target';
import { attr } from '@ember-data/model';
import { fragmentArray } from 'ember-data-model-fragments/attributes';
import { computed } from '@ember/object';

export default class TargetModel extends GeneratedTargetModel {
  // =attributes

  @attr('number', {
    isNestedAttribute: true,
    description: 'The  default port a target should use if present.',
  })
  default_port;

  /**
   * @type {[FragmentHostSourceModel]}
   */
  @fragmentArray('fragment-host-source', {
    readOnly: true,
    emptyArrayIfMissing: true,
  })
  host_sources;

  /**
   * Credential source ids are read only and can be
   * persisted via a dedicated call to `addCredentialSources()`.
   */
  @fragmentArray('fragment-string', {
    readOnly: true,
    emptyArrayIfMissing: true,
  })
  application_credential_source_ids;

  /**
   * An array of resolved host set and host catalog instances.  Model instances
   * must already be loaded into the store (this method will not load unloaded
   * instances).  Unresolvable instances are excluded from the array.
   * @type {[{model: HostSetModel, hostCatalog: HostCatalogModel}]}
   */
  @computed('host_sources.[]', 'store')
  get hostSets() {
    return this.host_sources
      .map(({ host_source_id, host_catalog_id }) => ({
        model: this.store.peekRecord('host-set', host_source_id),
        hostCatalog: this.store.peekRecord('host-catalog', host_catalog_id),
      }))
      .filter((hostSetRef) => hostSetRef.model !== null);
  }

  /**
   * An array of resolved credential library instances.  Model instances
   * must already be loaded into the store (this method will not load unloaded
   * instances).  Unresolvable instances are excluded from the array.
   * @type {[CredentialLibraryModel]}
   */
  @computed('application_credential_source_ids.[]', 'store')
  get credentialLibraries() {
    return this.application_credential_source_ids
      .map((source) =>
        this.store.peekRecord('credential-library', source.value)
      )
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
      (s) => s.isActive || s.isPending
    );
    return Boolean(pendingOrActiveSessions.length);
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
   * Adds credential libraries via the `add-credential-sources` method.
   * See serializer and adapter for more information.
   * @param {[string]} credentialLibraryIDs
   * @param {object} options
   * @param {object} options.adapterOptions
   * @return {Promise}
   */
  addCredentialSources(credentialLibraryIDs, options = { adapterOptions: {} }) {
    const defaultAdapterOptions = {
      method: 'add-credential-sources',
      credentialLibraryIDs,
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
   * Delete credential libraries via the `remove-credential-sources` method.
   * See serializer and adapter for more information.
   * @param {[string]} credentialLibraryIDs
   * @param {object} options
   * @param {object} options.adapterOptions
   * @return {Promise}
   */
  removeCredentialSources(
    credentialLibraryIDs,
    options = { adapterOptions: {} }
  ) {
    const defaultAdapterOptions = {
      method: 'remove-credential-sources',
      credentialLibraryIDs,
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
   * Delete a single credential library set via the `remove-credential-sources` method.
   * @param {number} credentialLibraryID
   * @param {object} options
   * @return {Promise}
   */
  removeCredentialSource(credentialLibraryID, options) {
    return this.removeCredentialSources([credentialLibraryID], options);
  }

  /**
   * True if the target type is tcp.
   * @type {boolean}
   */
  get isTCP() {
    return this.type === 'tcp';
  }

  /**
   * True if the target type is ssh.
   * @type {boolean}
   */
  get isSSH() {
    return this.type === 'ssh';
  }
}
