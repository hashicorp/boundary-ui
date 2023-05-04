/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Component from '@glimmer/component';
import { generateComponentID } from '../../../../../utilities/component-auto-id';

export default class RoseFormRadioRadioComponent extends Component {
  // =attributes
  className = 'rose-form-radio';
  id = generateComponentID();
}
