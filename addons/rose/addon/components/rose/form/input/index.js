/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Component from '@glimmer/component';
import { generateComponentID } from '../../../../utilities/component-auto-id';

export default class RoseFormInputComponent extends Component {
  // =attributes

  id = generateComponentID();
}
