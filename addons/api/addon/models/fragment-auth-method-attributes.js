import Fragment from 'ember-data-model-fragments/fragment';
import { attr } from '@ember-data/model';

export default class FragmentAuthMethodAttributesModel extends Fragment {
  // =attributes (OIDC)

  @attr('string', { readOnly: true }) state;
  @attr('string') issuer;
  @attr('string') client_id;
  @attr('string') client_secret;
  @attr('string') client_secret_hmac;
  @attr('number') max_age;
  @attr('string') api_url_prefix;
  @attr('string') callback_url;
  @attr('boolean') disable_discovered_config_validation;
  @attr('boolean') dry_run;
}
