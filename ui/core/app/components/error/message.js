import MessageComponent from 'rose/components/rose/message';
import { computed } from '@ember/object';

/*
 * Helpful error booleans are attached based on the error status code:
 *
 *   - 401 - `error.isUnauthenticated`:  the session isn't authenticated
 *   - 403 - `error.isForbidden`:  the session is authenticated but does not have
 *            permission to perform the requested action
 *   - 404 - `error.isNotFound`:  the requested resource could not be found
 *   - 500 - `error.isServer`:  an internal server error occurred
 *
 * For an unknown error state, i.e error state not matching to the above defined list:
 *   - unknown - `error.isUnknown`:  an error occurred, but we don't know which or
 *            we don't distinguish it yet
 */

const statuses = ['401', '403', '404', '500'];

export default class ErrorMessageComponent extends MessageComponent {
  // =methods

  /**
   * Returns an icon for error status.
   * @return {string}
   */
  @computed('args.status')
  get icon() {
    switch (this.args.status) {
      case '401':
      case '403':
        return 'disabled';
      case '404':
        return 'help-circle-outline';
      default:
        return 'alert-circle-outline';
    }
  }

  // TODO: Enable when help documentation can be linked in.
  /**
   * Returns an route string for help text in message.
   * @return {string}
   */
  // get helpRoute() {
  //   return 'index'
  // }

  /**
   * Returns 'unknown' status code when provided error status
   * isn't part of predefined statuses.
   * @return {string}
   */
  @computed('args.status')
  get messageCode() {
    let messageCode = this.args.status;
    if(!statuses.includes(messageCode)) messageCode = 'unknown';
    return messageCode;
  }

}
