import ApplicationSerializer from './application';
import { get } from '@ember/object';

export default class RoleSerializer extends ApplicationSerializer {
  // =methods

  /**
   * If `adapterOptions.serializeGrants` is true, the serialization should
   * include **only grants** and the version.  Normally, grants are not
   * serialized.
   * If `adapterOptions.principalIDs` is set (to an array of user and
   * group IDs), then the payload is serialized via `serializewithPrincipals`.
   * @override
   * @param {Snapshot} snapshot
   * @return {object}
   */
  serialize(snapshot) {
    const grants = get(snapshot, 'adapterOptions.grants');
    let serialized = super.serialize(...arguments);
    if (grants) serialized = this.serializeWithGrants(snapshot, grants);
    const principalIDs = snapshot?.adapterOptions?.principalIDs;
    if (principalIDs)
      serialized = this.serializewithPrincipals(snapshot, principalIDs);
    return serialized;
  }

  /**
   * Returns a payload containing only the grants array.
   * @param {Snapshot} snapshot
   * @param {[string]} grants
   * @return {object}
   */
  serializeWithGrants(snapshot, grants) {
    return {
      version: snapshot.attr('version'),
      grant_strings: grants
    };
  }

  /**
   * Returns a payload containing only the principal_ids array using IDs
   * passed into the function (rather than existing principals on the model).
   * @param {Snapshot} snapshot
   * @param {[string]} principalIDs
   * @return {object}
   */
  serializewithPrincipals(snapshot, principalIDs) {
    return {
      version: snapshot.attr('version'),
      principal_ids: principalIDs,
    };
  }
}
