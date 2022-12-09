/* eslint-disable ember/no-classic-components, ember/no-classic-classes, ember/require-tagless-components */
import Component from '@ember/component';
import layout from './index';

/**
 * An otherwise empty component that renders a block.  Used only by components
 * that yield simple contextual components, such as layouts yielding regions.
 */
export default Component.extend({
  layout,
});
