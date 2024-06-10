/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Component from '@glimmer/component';
import { generateComponentID } from '../../../../../utilities/component-auto-id';

export default class RoseListKeyValueItemComponent extends Component {
  // =attributes

  id = generateComponentID();
}
