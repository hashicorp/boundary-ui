import Component from '@ember/component';
import layout from '../../../templates/components/rose/form/select';
import ComponentAutoId from '../../../mixins/component-auto-id';

/**
 * A `<select>` element context component which yields option components.
 */
export default Component.extend(ComponentAutoId, {
  layout,
  tagName: '',
});
