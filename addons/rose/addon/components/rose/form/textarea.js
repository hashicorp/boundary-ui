import Component from '@ember/component';
import layout from '../../../templates/components/rose/form/textarea';
import ComponentAutoId from '../../../mixins/component-auto-id';

/**
 * A `<textarea>` element essentially identical to `Rose::Form::Input` except
 * for the field element.
 */
export default Component.extend(ComponentAutoId, {
  layout,
  tagName: '',
});
