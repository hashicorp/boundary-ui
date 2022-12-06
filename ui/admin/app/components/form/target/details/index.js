import Component from '@glimmer/component';
import { types } from 'api/models/target';

export default class FormTargetComponent extends Component {
  // =properties
  targetTypes = types;
  icon = types[this.args.model.type][0];
}
