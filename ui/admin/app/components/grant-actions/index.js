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

  get hasSpecificIds() {
    return (
      this.parsedGrantLine.idsValue &&
      !this.parsedGrantLine.idsValue.includes('*')
    );
  }

  get hasExplicitType() {
    return (
      this.parsedGrantLine.typeValue && this.parsedGrantLine.typeValue !== '*'
    );
  }

  get hasTemplateIds() {
    if (!this.hasSpecificIds) {
      return false;
    }

    return this.parsedGrantLine.idsValue
      .split(',')
      .filter(Boolean)
      .some((id) => id.startsWith('{{') && id.endsWith('}}'));
  }

  get compatibleIdsResourceType() {
    if (!this.hasSpecificIds || this.hasTemplateIds) {
      return null;
    }

    return getCompatibleResourceTypeForIds(
      this.schema,
      this.parsedGrantLine.idsValue,
    );
  }

  get hasInvalidType() {
    return (
      this.hasExplicitType &&
      !this.schema.resourcesByType[this.parsedGrantLine.typeValue]
    );
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

    return !childTypes.includes(this.parsedGrantLine.typeValue);
  }

  get actions() {
    if (!this.parsedGrantLine.idsValue && !this.parsedGrantLine.typeValue) {
      return [];
    }

    return this.#grantLineHelpers
      .getSuggestedActions(this.args.grantString)
      .filter((action) => action !== '*')
      .sort((left, right) => left.localeCompare(right));
  }

  get descriptionResourceType() {
    if (this.parsedGrantLine.typeValue === '*') {
      return null;
    }

    return (
      this.parsedGrantLine.typeValue ||
      this.#grantLineHelpers.getDetectedResourceType(this.args.grantString)
    );
  }

  get actionRows() {
    return this.actions.map((action) => ({
      name: action,
      description: this.getActionDescription(action),
    }));
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
