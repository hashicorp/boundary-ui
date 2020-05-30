import Component from '@ember/component';
import layout from '../../../templates/components/rose/nav/primary';
import ComponentAutoId from '../../../mixins/component-auto-id';

/**
 * A simple navigation component intended for the sidebar layout region.
 */
export default Component.extend(ComponentAutoId, {
  layout,
  tagName: '',
});
