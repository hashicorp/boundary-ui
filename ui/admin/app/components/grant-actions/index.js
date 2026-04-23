/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Component from '@glimmer/component';
import { service } from '@ember/service';

import {
  getDetectedResourceTypeForGrantLine,
  getSuggestedActionsForGrantLine,
  parseGrantLine,
} from 'admin/utils/grant-completions';

const ACTIONS_WITH_RESOURCE_TYPE = new Set([
  'create',
  'list',
  'read',
  'update',
  'delete',
  'read:self',
  'delete:self',
  'cancel',
  'cancel:self',
]);

export default class GrantActionsIndex extends Component {
  @service intl;

  get parsedGrantLine() {
    return parseGrantLine(this.args.grantString);
  }

  get hasGrantContext() {
    const { idsValue, typeValue } = this.parsedGrantLine;

    return Boolean(idsValue || typeValue);
  }

  get actions() {
    if (!this.hasGrantContext) {
      return [];
    }

    return getSuggestedActionsForGrantLine(
      this.args.grantsSchema,
      this.args.grantString,
    )
      .filter((action) => action !== '*')
      .sort((left, right) => left.localeCompare(right));
  }

  get descriptionResourceType() {
    const { typeValue } = this.parsedGrantLine;

    if (typeValue === '*') {
      return null;
    }

    return (
      typeValue ||
      getDetectedResourceTypeForGrantLine(
        this.args.grantsSchema,
        this.args.grantString,
      )
    );
  }

  get actionRows() {
    return this.actions.map((action) => ({
      name: action,
      description: this.getActionDescription(action),
    }));
  }

  get columns() {
    return [
      { key: 'name', label: this.intl.t('titles.action') },
      { key: 'description', label: this.intl.t('form.description.label') },
    ];
  }

  get showNoResourceTypeDetected() {
    return (
      !this.actions.length &&
      !getDetectedResourceTypeForGrantLine(
        this.args.grantsSchema,
        this.args.grantString,
      )
    );
  }

  get noSuggestionsLabel() {
    return this.intl.t('resources.role.edit-grants.no-suggestions');
  }

  get noResourceTypeDetectedLabel() {
    return 'No resource type detected.';
  }

  getActionDescription(action) {
    const translationKey = `resources.role.edit-grants.actions.${action}`;

    if (!this.intl.exists(translationKey)) {
      return action;
    }

    if (ACTIONS_WITH_RESOURCE_TYPE.has(action)) {
      if (!this.descriptionResourceType) {
        return action;
      }

      return this.intl.t(translationKey, {
        resourceType: this.descriptionResourceType,
      });
    }

    return this.intl.t(translationKey);
  }
}
