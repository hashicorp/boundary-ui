/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

/* eslint-disable */
// TODO: Convert this component into a glimmer component.
// Currently, this file causes three eslint errors.
// 1. Use Glimmer components instead of classic components.
// 2. Native JS classes should be used instead of classic classes.
// 3. Require tagless components by converting to a Glimmer component.
import Component from '@ember/component';
import layout from './index';

/**
 * An otherwise empty component that renders a block.  Used only by components
 * that yield simple contextual components, such as layouts yielding regions.
 */
export default Component.extend({
  layout,
});
