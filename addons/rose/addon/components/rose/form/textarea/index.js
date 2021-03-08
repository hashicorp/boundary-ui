import Component from '@glimmer/component';
import { generateComponentID } from '../../../../utilities/component-auto-id';

export default class RoseFormTextareaComponent extends Component {
  // =attributes

  id = generateComponentID();
}
