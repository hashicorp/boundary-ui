import Component from '@ember/component';
import layout from '../../templates/components/rose/anonymous';

/**
 * An otherwise empty component that renders a block.  Used only by components
 * that yield simple contextual components, such as layouts yielding regions.
 */
export default Component.extend({
  layout,
});
