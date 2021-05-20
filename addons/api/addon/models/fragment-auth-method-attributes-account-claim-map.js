import Fragment from 'ember-data-model-fragments/fragment';
import { attr } from '@ember-data/model';

export default class FragmentAuthMethodAttributesAccountClaimMapModel extends Fragment {
  // =attributes (OIDC)

  @attr('string') from;
  @attr('string') to;
}
