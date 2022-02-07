import ApplicationSerializer from './application';

const fieldByType = {
  aws: ['preferred_endpoints', 'filters'],
  azure: ['preferred_endpoints', 'filter'],
};
export default class HostSetSerializer extends ApplicationSerializer {
  // =properties

  /**
   * @type {boolean}
   */
  serializeScopeID = false;

  // =methods

  /**
   * If `adapterOptions.serializeHostIDs` is true, the serialization should
   * include **only host_ids** and the version.  Normally, these are not
   * serialized.
   * @override
   * @param {Snapshot} snapshot
   * @return {object}
   */
  serialize(snapshot) {
    const hostIDs = snapshot?.adapterOptions?.hostIDs;
    if (hostIDs) {
      return this.serializeWithHostIDs(snapshot, hostIDs);
    } else {
      switch (snapshot.record.compositeType) {
        case 'static':
          return this.serializeStatic(...arguments);
        default:
          return super.serialize(...arguments);
      }
    }
  }

  /**
   * Returns a payload containing only the host_ids array.
   * @param {Snapshot} snapshot
   * @param {[string]} hostIDs
   * @return {object}
   */
  serializeWithHostIDs(snapshot, hostIDs) {
    return {
      version: snapshot.attr('version'),
      host_ids: hostIDs,
    };
  }

  serializeStatic() {
    let serialized = super.serialize(...arguments);
    // Delete unnecessary fields for static type
    delete serialized.attributes;
    delete serialized.preferred_endpoints;
    return serialized;
  }

  serializeAttribute(snapshot, json, key, attribute) {
    const value = super.serializeAttribute(...arguments);
    const { isPlugin, compositeType } = snapshot.record;
    const { options } = attribute;

    if (isPlugin && options.isNestedAttribute) {
      if (!fieldByType[compositeType].includes(key)) {
        delete json.attributes[key];
      }
    }
    return value;
  }
}
