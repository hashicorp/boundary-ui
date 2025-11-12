/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import GeneratedAppTokenModel from '../generated/models/app-token';

export const STATUS_APP_TOKEN_UNKNOWN = 'unknown';
export const STATUS_APP_TOKEN_ACTIVE = 'active';
export const STATUS_APP_TOKEN_REVOKED = 'revoked';
export const STATUS_APP_TOKEN_EXPIRED = 'expired';
export const STATUS_APP_TOKEN_STALE = 'stale';
export const STATUSES_APP_TOKEN = Object.freeze([
  STATUS_APP_TOKEN_UNKNOWN,
  STATUS_APP_TOKEN_ACTIVE,
  STATUS_APP_TOKEN_REVOKED,
  STATUS_APP_TOKEN_EXPIRED,
  STATUS_APP_TOKEN_STALE,
]);

export default class AppTokenModel extends GeneratedAppTokenModel {
  // =attributes

  /**
   * @type {boolean}
   */
  get isActive() {
    return this.status === 'active';
  }

  get TTL() {
    // in milliseconds
    return this.expire_time && this.created_time
      ? this.expire_time.getTime() - this.created_time.getTime()
      : null;
  }

  get TTS() {
    // in milliseconds
    return this.time_to_stale_seconds
      ? this.time_to_stale_seconds * 1000
      : null;
  }
}
