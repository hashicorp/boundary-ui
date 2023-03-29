import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export default class FormEnableSessionRecordingIndexComponent extends Component {
  // =attributes
  @tracked toggleEnabled = true;
}
