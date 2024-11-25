import Component from '@glimmer/component';
import { generateComponentID } from 'rose/utilities/component-auto-id';

export default class FormStorageBucketMinioIndexComponent extends Component {
  // =attributes

  workerFilterLabelId = generateComponentID();
  workerFilterHelpId = generateComponentID();
}
