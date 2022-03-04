import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class FormHostSetAwsComponent extends Component {
  // =actions
  @tracked showSyncIntervalSeconds = true;

  @action
  toggleSyncIntervalSeconds(model) {
    this.showSyncIntervalSeconds = !this.showSyncIntervalSeconds;

    if (!this.showSyncIntervalSeconds) {
      model.sync_interval_seconds = null;
    }
  }
}
