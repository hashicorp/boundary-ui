import Component from '@glimmer/component';
import { generateComponentID } from '../../../../utilities/component-auto-id';
import { action } from '@ember/object';

export default class RoseDialogComponent extends Component {
  // =attributes

  /**
   * @type {string}
   */
  id = generateComponentID();
}
