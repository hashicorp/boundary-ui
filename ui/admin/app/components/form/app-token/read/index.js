/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Component from '@glimmer/component';
import { service } from '@ember/service';

export default class FormAppTokenReadComponent extends Component {
  @service intl;

  statusConfig = {
    active: { color: 'success' },
    expired: { color: 'critical' },
    revoked: { color: 'critical' },
    stale: { color: 'critical' },
    unknown: { color: 'neutral' },
  };

  /**
   * Returns status badge configuration for app tokens
   * @returns {object}
   */
  get statusBadge() {
    const status = this.args.model?.status;
    if (!status) return { text: '', color: 'neutral' };

    const config = this.statusConfig[status] || { color: 'neutral' };
    return {
      text: this.intl.t(`resources.app-token.status.${status}`),
      color: config.color,
    };
  }

  /**
   * Returns scope information (icon, displayName) based on scope type
   * @returns {object}
   */
  get scopeInfo() {
    const scope = this.args.model.scopeModel;
    let icon = 'grid';

    if (scope.isGlobal) {
      icon = 'globe';
    } else if (scope.isOrg) {
      icon = 'org';
    }

    return {
      icon,
      text: scope.displayName,
    };
  }

  /**
   * Returns formatted TTL using format-time-duration helper
   * @returns {number|null} TTL in days for format-day-year helper, or null
   */
  get ttlFormatted() {
    const ttl = this.args.model?.TTL;
    if (!ttl) return null;

    // Convert milliseconds to days for format-day-year helper
    return Math.floor(ttl / (1000 * 60 * 60 * 24));
  }

  /**
   * Returns formatted TTS in days for format-day-year helper
   * @returns {number|null}
   */
  get ttsFormatted() {
    const tts = this.args.model?.TTS;
    if (!tts) return null;

    // Convert milliseconds to days for format-day-year helper
    return Math.floor(tts / (1000 * 60 * 60 * 24));
  }
}
