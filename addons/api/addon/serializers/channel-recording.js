/**
 * Copyright IBM Corp. 2024, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import ApplicationSerializer from './application';
import { EmbeddedRecordsMixin } from '@ember-data/serializer/rest';

export default class ChannelSerializer extends ApplicationSerializer.extend(
  EmbeddedRecordsMixin,
) {
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
