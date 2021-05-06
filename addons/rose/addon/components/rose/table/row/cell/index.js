import Component from '@ember/component';
import layout from './index';
import { computed } from '@ember/object';

export default Component.extend({
  layout,
  tagName: 'td',
  classNameBindings: ['cellTypeStyle', 'cellStyle'],
  cellTypeStyle: computed(function () {
    return this.tagName.match('th')
      ? `rose-table-header-cell`
      : 'rose-table-cell';
  }),
  cellStyle: computed(function () {
    return this.style ? `rose-table-cell-${this.style}` : '';
  }),
});
