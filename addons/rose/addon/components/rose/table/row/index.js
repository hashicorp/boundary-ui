/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Component from '@ember/component';
import layout from './index';

/**
 * A table row component that uses tr table element and
 * configures a table cell element.
 */
export default Component.extend({
  layout,
  tagName: '',
});
