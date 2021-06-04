import Fragment from 'ember-data-model-fragments/fragment';
import { attr } from '@ember-data/model';

export default class FragmentAccountAttributesModel extends Fragment {
  // =attributes (password)
  @attr('string', {
    for: 'password',
    description: 'The account login name',
  })
  login_name;

  // =attributes (OIDC)
  @attr('string', { for: 'oidc' }) subject;
  @attr('string', { for: 'oidc' }) issuer;
  @attr('string', { for: 'oidc', readOnly: true }) email;
  @attr('string', { for: 'oidc', readOnly: true }) full_name;
}
