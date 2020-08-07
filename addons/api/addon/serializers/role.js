import ApplicationSerializer from './application';
import { get } from '@ember/object';

export default class RoleSerializer extends ApplicationSerializer {

  // =methods

  /**
   * If `adapterOptions.serializeGrants` is true, the serialization should
   * include **only grants** and nothing else.  Normally, grants are not
   * serialized.
   * @override
   * @param {Snapshot} snapshot
   * @return {object}
   */
  serialize(snapshot) {
    const serializeGrants = get(snapshot, 'adapterOptions.serializeGrants');
    let serialized = super.serialize(...arguments);
    if (serializeGrants) serialized = this.serializeWithGrants(snapshot);
    return serialized;
  }

  /**
   * Returns a payload containing only the grants array.
   * @param {Snapshot} snapshot
   * @return {object}
   */
  serializeWithGrants(snapshot) {
    return {
      grants: snapshot.attr('grants')
    };
  }

}
