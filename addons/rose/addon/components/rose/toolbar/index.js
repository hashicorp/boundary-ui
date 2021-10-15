import Component from '@glimmer/component';
import { generateComponentID } from '../../../utilities/component-auto-id';

export default class RoseToolbarComponent extends Component {
  // =attributes

  id = generateComponentID();
}
