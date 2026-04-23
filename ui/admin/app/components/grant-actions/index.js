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
}
