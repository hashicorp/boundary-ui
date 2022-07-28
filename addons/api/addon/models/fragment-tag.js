import Fragment from 'ember-data-model-fragments/fragment';
import { array } from 'ember-data-model-fragments/attributes';

export default class FragmentTagModel extends Fragment {
  // =attributes

  @array('string', {
    readOnly: true,
  })
  type;
}
