import Component from '@glimmer/component';
import { generateComponentID } from '../../../../utilities/component-auto-id';

export default class RoseFormFieldsetComponent extends Component {
  // =attributes

  /**
   * @type {string}
   */
  id = generateComponentID();
}
