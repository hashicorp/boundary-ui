import BaseModel from '../../models/base';
import { attr } from '@ember-data/model';

/**
 *
 */
export default class GeneratedAuthMethodModel extends BaseModel {
  // =attributes

  @attr('boolean', {
    description: 'Specifies if this is the primary auth method for its scope.',
    readOnly: true,
  })
  is_primary;

  @attr('string', {
    description: 'The type of the resource, to help differentiate schemas',
  })
  type;

  @attr('string', {
    description: 'Optional name for identification purposes',
  })
  name;

  @attr('string', {
    description: 'Optional user-set description for identification purposes',
  })
  description;

  @attr('date', {
    description: 'The time this resource was created\nOutput only.',
    readOnly: true,
  })
  created_time;

  @attr('date', {
    description: 'The time this resource was last updated\nOutput only.',
    readOnly: true,
  })
  updated_time;

  @attr('boolean', {
    description: 'Whether the resource is disabled',
  })
  disabled;

  @attr('number', {
    description: 'Current version number of this resource.',
  })
  version;

  @attr('string', { readOnly: true, isNestedAttribute: true }) state;

  @attr('string', { isNestedAttribute: true }) issuer;

  @attr('string', { isNestedAttribute: true }) client_id;

  @attr('string', { isNestedAttribute: true }) client_secret;

  @attr('string', { readOnly: true, isNestedAttribute: true })
  client_secret_hmac;

  @attr('number', { isNestedAttribute: true }) max_age;

  @attr('string', { isNestedAttribute: true }) api_url_prefix;

  @attr('string', { readOnly: true, isNestedAttribute: true }) callback_url;

  @attr('boolean', { isNestedAttribute: true })
  disable_discovered_config_validation;

  @attr('boolean', { isNestedAttribute: true }) dry_run;

  @attr('string-array', {
    emptyArrayIfMissing: true,
    isNestedAttribute: true,
  })
  claims_scopes;

  @attr('string-array', {
    emptyArrayIfMissing: true,
    isNestedAttribute: true,
  })
  signing_algorithms;

  @attr('string-array', {
    emptyArrayIfMissing: true,
    isNestedAttribute: true,
  })
  allowed_audiences;

  @attr('string-array', {
    emptyArrayIfMissing: true,
    isNestedAttribute: true,
  })
  idp_ca_certs;

  @attr('account-claim-map-array', {
    emptyArrayIfMissing: true,
    isNestedAttribute: true,
  })
  account_claim_maps;
}
