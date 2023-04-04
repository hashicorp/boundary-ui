import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class FormEnableSessionRecordingIndexComponent extends Component {
  // =attributes
  @tracked toggleEnabled = true;

  //actions
  /**
   * toggle to enable session recording for the target
   */
  @action
  toggleSessionRecording() {
    this.toggleEnabled = !this.toggleEnabled;
  }

  @action
  selectStorageBucket({ target: { value: selectedStorageBucketID } }) {
    this.args.model.storage_bucket_id = selectedStorageBucketID;
  }
}
