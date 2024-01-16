/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import ApplicationSerializer from './application';
import { EmbeddedRecordsMixin } from '@ember-data/serializer/rest';

export default class ChannelSerializer extends ApplicationSerializer.extend(
  EmbeddedRecordsMixin,
) {
  normalize(typeClass, hash, ...rest) {
    const normalizedHash = structuredClone(hash);
    const normalized = super.normalize(typeClass, normalizedHash, ...rest);
    // we should not override the ember models errors field,
    // so we rename the errors field from the api

    const err = normalized.data.attributes.errors_session_recording;
    delete normalized.data.attributes.errors_session_recording;
    normalized.data.attributes.errors = err;
    return normalized;
  }
}
