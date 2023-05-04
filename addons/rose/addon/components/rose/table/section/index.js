/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Component from '@ember/component';
import layout from './index';

/**
 * A table section component that configures a row component.
 * Section can be: thead, tbody, or tfoot table elements.
 */
export default Component.extend({
  layout,
  tagName: '',
});
