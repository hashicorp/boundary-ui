import Fragment from 'ember-data-model-fragments/fragment';
import { attr } from '@ember-data/model';

export default class FragmentTargetAttributesModel extends Fragment {
  @attr('number', {
    description: 'The  default port a target should use if present.',
  })
  default_port;
}
