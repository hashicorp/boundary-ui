import Component from '@ember/component';
import layout from '../../../templates/components/rose/form/input';
import ComponentAutoId from '../../../mixins/component-auto-id';

/**
 * A simple HTML `<input>` element.
 */
export default Component.extend(ComponentAutoId, {
  layout,
  tagName: '',
});
