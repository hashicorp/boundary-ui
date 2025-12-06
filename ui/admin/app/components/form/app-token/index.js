import Component from '@glimmer/component';
import { action } from '@ember/object';

const MAX_TTL_SECONDS = 94670856;

export default class FormAppTokenComponent extends Component {
  // =attributes

  get maxTTL() {
    return MAX_TTL_SECONDS;
  }

  // =actions

  @action
  updateTime(field, time) {
    this.args.model[field] = time;
  }
}
