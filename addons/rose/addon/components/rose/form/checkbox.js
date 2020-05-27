import Component from '@ember/component';
import layout from '../../../templates/components/rose/form/checkbox';
import ComponentAutoId from '../../../mixins/component-auto-id';

/**
 * A simple HTML `<input type="checkbox">` element.
 */
export default Component.extend(ComponentAutoId, {
  layout,
  tagName: '',
});
