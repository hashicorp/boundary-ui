/* eslint-disable ember/no-classic-components, ember/no-classic-classes, ember/require-tagless-components, ember/require-computed-property-dependencies, ember/require-return-from-computed */
import Component from '@ember/component';
import layout from './index';
import { computed } from '@ember/object';

export default Component.extend({
  layout,
  tagName: 'td',
  classNameBindings: ['cellTypeStyle', 'cellShrink', 'cellAlignmentStyle'],
  cellTypeStyle: computed(function () {
    return this.tagName.match('th')
      ? `rose-table-header-cell`
      : 'rose-table-cell';
  }),
  cellShrink: computed(function () {
    if (this.shrink) {
      return 'rose-table-cell-shrink';
    }
  }),
  cellAlignmentStyle: computed(function () {
    if (this.alignRight) {
      return 'align-right';
    }

    if (this.alignCenter) {
      return 'align-center';
    }
  }),
});
