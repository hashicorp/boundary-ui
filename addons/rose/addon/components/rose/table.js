import Component from '@ember/component';
import layout from '../../templates/components/rose/table';

/**
 * A table component that support displaying rows of data as header, body, and footer.
 * Supports setting a caption for a11y.
 */
export default Component.extend({
  layout,
  tagName: '',
});
