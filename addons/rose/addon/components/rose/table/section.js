import Component from '@ember/component';
import layout from '../../../templates/components/rose/table/section';

/**
 * A table section component that configures a row component.
 * Section can be: thead, tbody, or tfoot table elements.
 */
export default Component.extend({
  layout,
  tagName: '',
});
