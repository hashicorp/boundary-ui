import Component from '@ember/component';
import layout from './index';
import { computed } from '@ember/object';

export default Component.extend({
  layout,
  tagName: 'td',
  classNameBindings: ['cellTypeStyle', 'cellExpand', 'cellAlignmentStyle'],
  cellTypeStyle: computed(function () {
    return this.tagName.match('th')
      ? `rose-table-header-cell`
      : 'rose-table-cell';
  }),
  cellExpand: computed(function () {
    if (this.expand) {
      return 'rose-table-cell-expand'
    }
  }),
  cellAlignmentStyle: computed(function () {
    if (this.alignRight) {
      return 'align-right';
    }
    
    if (this.alignCenter) {
      return 'align-center';
    }
  })
});
