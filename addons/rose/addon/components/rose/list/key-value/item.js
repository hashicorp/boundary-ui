import Component from '@ember/component';
import layout from '../../../../templates/components/rose/list/key-value/item';
import ComponentAutoId from '../../../../mixins/component-auto-id';

export default Component.extend(ComponentAutoId, {
  layout,
  tagName: '',
});
