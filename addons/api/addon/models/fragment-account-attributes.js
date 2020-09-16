import Fragment from 'ember-data-model-fragments/fragment';
import { attr } from '@ember-data/model';

export default class FragmentAccountAttributesModel extends Fragment {
  @attr('string', {
    description: 'The account login name',
  })
  login_name;
}
