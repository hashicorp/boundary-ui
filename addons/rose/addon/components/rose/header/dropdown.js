import Component from '@ember/component';
import layout from '../../../templates/components/rose/header/dropdown';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default Component.extend({
  layout,
  tagName: '',

  @tracked isOpen: false,

  @action
  toggle(event) {
    this.isOpen = event.target.open;
  },

  @action
  addClickOutside(element) {
    document.addEventListener('click', event => this.clickOutside(event, element), true);
  },

  @action
  removeClickOutside(element) {
    document.removeEventListener('click', event => this.clickOutside(event, element), true);
  },

  @action
  clickOutside(event, element) {
    // Only close dropdown when non-nested elements are clicked
    if(element.contains(event.target)) { return; }
    this.removeClickOutside(element);
    this.isOpen = false;
  }
});
