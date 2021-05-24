import Fragment from 'ember-data-model-fragments/fragment';
import { attr } from '@ember-data/model';
import { fragmentArray } from 'ember-data-model-fragments/attributes';

export default class FragmentAuthMethodAttributesModel extends Fragment {
  // =attributes (OIDC)

  @attr('string', { readOnly: true }) state;
  @attr('string') issuer;
  @attr('string') client_id;
  @attr('string') client_secret;
  @attr('string', { readOnly: true }) client_secret_hmac;
  @attr('number') max_age;
  @attr('string') api_url_prefix;
  @attr('string', { readOnly: true }) callback_url;
  @attr('boolean') disable_discovered_config_validation;
  @attr('boolean') dry_run;

  @fragmentArray('fragment-auth-method-attributes-account-claim-map', {
    emptyArrayIfMissing: true,
  })
  account_claim_maps;

  @fragmentArray('fragment-string', {
    emptyArrayIfMissing: true,
  })
  claims_scopes;

  @fragmentArray('fragment-string', {
    emptyArrayIfMissing: true,
  })
  signing_algorithms;

  @fragmentArray('fragment-string', {
    emptyArrayIfMissing: true,
  })
  allowed_audiences;

  @fragmentArray('fragment-string', { emptyArrayIfMissing: true }) idp_ca_certs;
}
