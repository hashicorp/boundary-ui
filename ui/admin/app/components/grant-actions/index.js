/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Component from '@glimmer/component';
import { cached } from '@glimmer/tracking';
import { service } from '@ember/service';

import { analyzeGrantString } from 'admin/utils/grant-completions';

export default class GrantActionsIndex extends Component {
  @service intl;

  @cached
  get grantAnalysis() {
    return analyzeGrantString(
      this.args.grantsSchema ?? {},
      this.args.grantString,
    );
  }

  get actionRows() {
    return this.grantAnalysis.actions.map((action) => ({
      name: action,
      description: this.getActionDescription(action),
    }));
  }

  get showNoResourceTypeDetected() {
    const { actions, detectedResourceType } = this.grantAnalysis;
    return (
      !this.showInvalidIdAndType && !actions.length && !detectedResourceType
    );
  }

  get showInvalidIdAndType() {
    const {
      actions,
      hasInvalidType,
      hasInvalidIds,
      hasInvalidPinnedIdTypeCombination,
    } = this.grantAnalysis;
    return (
      !actions.length &&
      (hasInvalidType || hasInvalidIds || hasInvalidPinnedIdTypeCombination)
    );
  }

  getActionDescription(action) {
    const { detectedResourceType } = this.grantAnalysis;
    const specificKey = `resources.role.edit-grants.actions.${action}`;
    const genericKey = `resources.role.edit-grants.actions.generic.${action}`;

    if (detectedResourceType && this.intl.exists(specificKey)) {
      const resourceType = Array.isArray(detectedResourceType)
        ? this.intl.formatList(detectedResourceType, { type: 'disjunction' })
        : detectedResourceType;
      // Determine the appropriate article ("a" or "an") to use based on the
      // detected resource type. "user" is a special case that uses "a" instead
      // of "an" because it's pronounced "you" so I don't include it below.
      const article = /^[aeio]/i.test(resourceType) ? 'an' : 'a';
      return this.intl.t(specificKey, { resourceType, article });
    }

    if (this.intl.exists(genericKey)) {
      return this.intl.t(genericKey);
    }

    if (this.intl.exists(specificKey)) {
      return this.intl.t(specificKey);
    }

    return action;
  }
}
