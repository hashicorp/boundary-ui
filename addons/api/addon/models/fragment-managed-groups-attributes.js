import Fragment from 'ember-data-model-fragments/fragment';
import { attr } from '@ember-data/model';

export default class FragmentManagedGroupsAttributesModel extends Fragment {
  // =attributes (OIDC)

  @attr('string', {
    description:
      'The boolean expression filter to use to determine membership.',
  })
  filter;
}
