/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import ApplicationSerializer from './application';
import { EmbeddedRecordsMixin } from '@ember-data/serializer/rest';
export default class RecordingSerializer extends ApplicationSerializer.extend(
  EmbeddedRecordsMixin,
) {
  attrs = {
    connection_recordings: { embedded: 'always' },
  };

  serialize(snapshot) {
    let serialized = super.serialize(...arguments);
    // The post request for reapply-storage-policy doesn't expect a payload,
    // so we just delete these
    if (snapshot?.adapterOptions?.method === 'reapply-storage-policy') {
      delete serialized.retain_until;
      delete serialized.delete_after;
      delete serialized.connection_recordings;
    }
    return serialized;
  }

  normalize(typeClass, hash, ...rest) {
    const normalizedHash = structuredClone(hash);
    const err = normalizedHash.errors;
    delete normalizedHash.errors;
    const normalized = super.normalize(typeClass, normalizedHash, ...rest);
    // we should not override the ember models errors field,
    // so we rename the errors field from the api
    normalized.data.attributes.errors_number = err;

    return normalized;
  }
}
