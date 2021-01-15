import BaseAuthenticator from './base';
// import { resolve, reject } from 'rsvp';
// import fetch from 'fetch';
//import { Promise } from 'rsvp';

/**
 *
 */
export default class OIDCAuthenticator extends BaseAuthenticator {

  // =unimplemented methods
  // TODO: implement ;-)

  buildAuthEndpointURL(/* {
    scope: { id: scopeID },
    authMethod: { id: authMethodID },
  } */) { }

  async authenticate(
    // creds,
    // requestCookies = true,
    // options
  ) {
    return false;
  }
}
