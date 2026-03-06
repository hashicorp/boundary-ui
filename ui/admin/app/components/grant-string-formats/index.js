/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';

export default class GrantStringFormatsIndex extends Component {
  // =services

  @service intl;

  // =attributes

  stringFormatTypes = {
    resourceType: 'resource-type',
    resource: 'resource',
    pinnedId: 'pinned-id',
  };

  stringFormats = {
    [this.stringFormatTypes.resourceType]:
      `type=<${this.intl.t('resources.role.edit-grants.string-formats.insert-resource-types')}>;actions=<${this.intl.t('resources.role.edit-grants.string-formats.insert-actions')}>`,
    [this.stringFormatTypes.resource]:
      `id=<${this.intl.t('resources.role.edit-grants.string-formats.insert-resource-ids')}>;actions=<${this.intl.t('resources.role.edit-grants.string-formats.insert-actions')}>`,
    [this.stringFormatTypes.pinnedId]:
      `id=<${this.intl.t('resources.role.edit-grants.string-formats.insert-id')}>;type=<${this.intl.t('resources.role.edit-grants.string-formats.insert-resource-types')}>;actions=<${this.intl.t('resources.role.edit-grants.string-formats.insert-actions')}>`,
  };

  @tracked selectedFormatType = this.stringFormatTypes.resourceType;

  /**
   * Returns the string format based on the selected format type.
   * @type {string}
   */
  get stringFormat() {
    return this.stringFormats[this.selectedFormatType];
  }
}
