import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

/**
 * A checkbox group represents an array of arbitrary items, which differs from
 * single checkboxes which represent boolean values.  When checkboxes within a
 * checkbox are toggled, their associated item is toggled within the group's
 * array value.
 *
 * The term "item" is used to disambiguate it from "value", which has an
 * existing meaning in the context of form fields.  However, items
 * are just arbitrary values.
 */
export default class RoseFormCheckboxGroupComponent extends Component {
  // =actions

  /**
   * Returns a new copy of the @selectedItems array where the given item is:
   *   - removed from the array, if it was already present
   *   - or added to the array, if it was not already present
   */
  @action
  toggleItem(item) {
    console.log(item, 'itemmmmm')
    const selectedItems = this.args.selectedItems || [];
    const currentItems = [...selectedItems];

    if (currentItems.includes(item)) {
      const i = currentItems.indexOf(item);
      currentItems.splice(i, 1);
    } else {
      currentItems.push(item);
    }

    if (this.args.onChange) this.args.onChange(currentItems);
  }
}
