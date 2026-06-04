/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import { action } from '@ember/object';

export default class GrantStringFormatsIndex extends Component {
  // =services

  @service intl;

  // =attributes

  stringFormatTypes = {
    resourceType: 'resource-type',
    resource: 'resource',
    pinnedId: 'pinned-id',
    outputFields: 'output-fields',
    accountTemplate: 'account-template',
    userTemplate: 'user-template',
  };

  stringFormatTypesList = Object.values(this.stringFormatTypes);

  stringFormats = {
    [this.stringFormatTypes.resourceType]: {
      text: `type=<${this.intl.t('resources.role.edit-grants.string-formats.insert-resource-type')}>;actions=<${this.intl.t('resources.role.edit-grants.string-formats.insert-actions')}>`,
      link: 'role.grant-string-format.resource-type',
    },
    [this.stringFormatTypes.resource]: {
      text: `ids=<${this.intl.t('resources.role.edit-grants.string-formats.insert-resource-ids')}>;actions=<${this.intl.t('resources.role.edit-grants.string-formats.insert-actions')}>`,
      link: 'role.grant-string-format.resource',
    },
    [this.stringFormatTypes.pinnedId]: {
      text: `ids=<${this.intl.t('resources.role.edit-grants.string-formats.insert-ids')}>;type=<${this.intl.t('resources.role.edit-grants.string-formats.insert-resource-type')}>;actions=<${this.intl.t('resources.role.edit-grants.string-formats.insert-actions')}>`,
      link: 'role.grant-string-format.pinned-id',
    },
    [this.stringFormatTypes.outputFields]: {
      text: `output_fields=<${this.intl.t('resources.role.edit-grants.string-formats.insert-output-fields')}>`,
      link: 'role.grant-string-format.output-fields',
    },
    [this.stringFormatTypes.accountTemplate]: {
      text: 'ids={{.Account.Id}}',
      link: 'role.grant-string-format.account-template',
    },
    [this.stringFormatTypes.userTemplate]: {
      text: 'ids={{.User.Id}}',
      link: 'role.grant-string-format.user-template',
    },
  };

  @tracked selectedFormatType = this.stringFormatTypes.resourceType;

  /**
   * Returns the string format based on the selected format type.
   * @type {string}
   */
  get stringFormat() {
    return this.stringFormats[this.selectedFormatType];
  }

  // =actions

  @action
  changeSelectedFormatType(type) {
    this.selectedFormatType = type;
  }
}
