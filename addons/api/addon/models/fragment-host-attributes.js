import Fragment from 'ember-data-model-fragments/fragment';
import { attr } from '@ember-data/model';

export default class FragmentHostAttributesModel extends Fragment {

  @attr('string', {
    description: 'The address (DNS or IP name) used to reach the host'
  }) address;
}
