/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import ApplicationSerializer from './application';

const fieldByType = {
  aws: ['preferred_endpoints', 'filters', 'sync_interval_seconds'],
  azure: ['preferred_endpoints', 'filter_string', 'sync_interval_seconds'],
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
    delete serialized.sync_interval_seconds;
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

    if (key === 'filter_string') {
      const { filter_string } = json.attributes;
      if (filter_string) {
        json.attributes.filter = json.attributes.filter_string;
      }
      delete json.attributes.filter_string;
    }

    return value;
  }

  /**
   * Temporarily converts `filters` to an array if it is a string.  This is a
   * quirk of the API.
   *
   * TODO:  remove once API consistently returns arrays.
   */
  normalize(typeClass, hash, ...rest) {
    const normalizedHash = structuredClone(hash);

    if (typeof normalizedHash?.attributes?.filters === 'string') {
      normalizedHash.attributes.filters = [normalizedHash.attributes.filters];
    }

    // Change name from filter to filter_string
    if (normalizedHash?.attributes?.filter) {
      normalizedHash.attributes.filter_string =
        normalizedHash.attributes.filter;
      delete normalizedHash.attributes.filter;
    }

    return super.normalize(typeClass, normalizedHash, ...rest);
  }
}
