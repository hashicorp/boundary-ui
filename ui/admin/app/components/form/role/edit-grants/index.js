/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Component from '@glimmer/component';

/**
 * Form component for editing role grants. Allows users to compose grant
 * strings and view available actions for a selected resource type.
 *
 * @class FormRoleEditGrantsIndex
 * @extends Component
 */
export default class FormRoleEditGrantsIndexComponent extends Component {
  // =attributes

  /**
   * @type {string}
   */
  selectedResourceType = 'target';
}
