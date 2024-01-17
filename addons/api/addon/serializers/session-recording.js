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

  serialize() {
    let serialized = super.serialize(...arguments);
    // the post request doesn't expect a payload, so we just delete these
    delete serialized.retain_until;
    delete serialized.delete_after;
    delete serialized.connection_recordings;
    delete serialized.scope_id;
    return serialized;
  }

  normalize(typeClass, hash, ...rest) {
    const normalizedHash = structuredClone(hash);
    const normalized = super.normalize(typeClass, normalizedHash, ...rest);
    // we should not override the ember models errors field,
    // so we rename the errors field from the api

    const err = normalized.data.attributes.errors;
    delete normalized.data.attributes.errors;
    normalized.data.attributes.errors_number = err;
    return normalized;
  }
}
