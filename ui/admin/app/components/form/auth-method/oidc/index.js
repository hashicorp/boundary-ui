import Component from '@glimmer/component';
import { options } from 'api/models/auth-method';

export default class FormAuthMethodOidcComponent extends Component {
  // =attributes
  /**
   * @type {object}
   */
  signingAlgorithms = options.oidc.signing_algorithms;

  /**
   * @type {object}
   */
  toClaims = options.oidc.account_claim_maps.to;

  /**
   * @type {string}
   */
  newSigningAlgorithm = options.oidc.signing_algorithms[0];
}
