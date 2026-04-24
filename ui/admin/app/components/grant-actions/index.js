/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Component from '@glimmer/component';
import { service } from '@ember/service';

import {
  createGrantLineHelpers,
  getCompatibleResourceTypeForIds,
  normalizeGrantsSchema,
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

  schema = normalizeGrantsSchema(this.args.grantsSchema ?? {});

  #grantLineHelpers = createGrantLineHelpers(this.args.grantsSchema ?? {});

  get parsedGrantLine() {
    return parseGrantLine(this.args.grantString);
  }

  get idsValue() {
    return this.parsedGrantLine.idsValue;
  }

  get typeValue() {
    return this.parsedGrantLine.typeValue;
  }

  get hasGrantContext() {
    return Boolean(this.idsValue || this.typeValue);
  }

  get hasSpecificIds() {
    return Boolean(this.idsValue) && !this.idsValue.includes('*');
  }

  get hasExplicitType() {
    return Boolean(this.typeValue) && this.typeValue !== '*';
  }

  get hasTemplateIds() {
    if (!this.hasSpecificIds) {
      return false;
    }

    return this.idsValue
      .split(',')
      .filter(Boolean)
      .some((id) => id.startsWith('{{') && id.endsWith('}}'));
  }

  get compatibleIdsResourceType() {
    if (!this.hasSpecificIds || this.hasTemplateIds) {
      return null;
    }

    return getCompatibleResourceTypeForIds(this.schema, this.idsValue);
  }

  get hasInvalidType() {
    return this.hasExplicitType && !this.schema.resourcesByType[this.typeValue];
  }

  get hasInvalidIds() {
    return (
      this.hasSpecificIds &&
      !this.hasTemplateIds &&
      !this.compatibleIdsResourceType
    );
  }

  get hasInvalidPinnedIdTypeCombination() {
    if (
      !this.hasSpecificIds ||
      !this.hasExplicitType ||
      this.hasInvalidIds ||
      this.hasInvalidType
    ) {
      return false;
    }

    const childTypes =
      this.schema.childResourceTypesByParentType[
        this.compatibleIdsResourceType
      ] ?? [];

    return !childTypes.includes(this.typeValue);
  }

  get actions() {
    if (!this.hasGrantContext) {
      return [];
    }

    return this.#grantLineHelpers
      .getSuggestedActions(this.args.grantString)
      .filter((action) => action !== '*')
      .sort((left, right) => left.localeCompare(right));
  }

  get descriptionResourceType() {
    if (this.typeValue === '*') {
      return null;
    }

    return (
      this.typeValue ||
      this.#grantLineHelpers.getDetectedResourceType(this.args.grantString)
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
      !this.showInvalidIdAndType &&
      !this.actions.length &&
      !this.#grantLineHelpers.getDetectedResourceType(this.args.grantString)
    );
  }

  get showInvalidIdAndType() {
    return (
      !this.actions.length &&
      (this.hasInvalidType ||
        this.hasInvalidIds ||
        this.hasInvalidPinnedIdTypeCombination)
    );
  }

  get noSuggestionsLabel() {
    return this.intl.t('resources.role.edit-grants.no-suggestions');
  }

  get noResourceTypeDetectedLabel() {
    return this.intl.t('resources.role.edit-grants.actions.no-type-detected');
  }

  get invalidIdAndTypeLabel() {
    return this.intl.t('resources.role.edit-grants.actions.invalid-id-or-type');
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
