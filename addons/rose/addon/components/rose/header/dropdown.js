import Component from '@ember/component';
import layout from '../../../templates/components/rose/header/dropdown';
import { action } from '@ember/object';

export default Component.extend({
  layout,
  tagName: '',

  // Uses details widget state to close dropdown
  @action
  close(element) {
    if (element.open) {
      element.open = false;
    }
  },
});
