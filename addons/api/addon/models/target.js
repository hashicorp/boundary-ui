import GeneratedTargetModel from '../generated/models/target';
import { fragment, fragmentArray } from 'ember-data-model-fragments/attributes';
import { computed } from '@ember/object';

export default class TargetModel extends GeneratedTargetModel {
  // =attributes

  /**
   * Attributes of this resource, if any, represented as a JSON fragment.
   * @type {FragmentTargetAttributesModel}
   */
  @fragment('fragment-target-attributes', { defaultValue: {} }) attributes;

  /**
   * @type {[FragmentHostSetModel]}
   */
  @fragmentArray('fragment-host-set', {
    readOnly: true,
    emptyArrayIfMissing: true,
  })
  host_sets;

  /**
   * @type {[FragmentCredentialLibrary]}
   */
  @fragmentArray('fragment-credential-library', {
    readOnly: true,
    emptyArrayIfMissing: true,
  })
  credential_libraries;

  /**
   * An array of resolved host set and host catalog instances.  Model instances
   * must already be loaded into the store (this method will not load unloaded
   * instances).  Unresolvable instances are excluded from the array.
   * @type {[{model: HostSetModel, hostCatalog: HostCatalogModel}]}
   */
  @computed('host_sets.[]', 'store')
  get hostSets() {
    return this.host_sets
      .map(({ host_set_id, host_catalog_id }) => ({
        model: this.store.peekRecord('host-set', host_set_id),
        hostCatalog: this.store.peekRecord('host-catalog', host_catalog_id),
      }))
      .filter((hostSetRef) => hostSetRef.model !== null);
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

  /**
   * An array of resolved credential library instances.  Model instances
   * must already be loaded into the store (this method will not load unloaded
   * instances).  Unresolvable instances are excluded from the array.
   * @type {[CredentialLibraryModel]}
   */
  @computed('credential_libraries.[]', 'store')
  get credentialLibraries() {
    return this.credential_libraries
      .map((id) => this.store.peekRecord('credential-library', id))
      .filter(Boolean);
  }

  // =methods

  /**
   * Adds host sets via the `add-host-sets` method.
   * See serializer and adapter for more information.
   * @param {[string]} hostSetIDs
   * @param {object} options
   * @param {object} options.adapterOptions
   * @return {Promise}
   */
  addHostSets(hostSetIDs, options = { adapterOptions: {} }) {
    const defaultAdapterOptions = {
      method: 'add-host-sets',
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
   * Delete host sets via the `remove-host-sets` method.
   * See serializer and adapter for more information.
   * @param {[string]} hostSetIDs
   * @param {object} options
   * @param {object} options.adapterOptions
   * @return {Promise}
   */
  removeHostSets(hostSetIDs, options = { adapterOptions: {} }) {
    const defaultAdapterOptions = {
      method: 'remove-host-sets',
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
   * Delete a single host set via the `remove-host-sets` method.
   * @param {number} hostSetID
   * @param {object} options
   * @return {Promise}
   */
  removeHostSet(hostSetID, options) {
    return this.removeHostSets([hostSetID], options);
  }
}
