import Message from 'rose/components/rose/message';
import { inject as service } from '@ember/service';

/*
  * Helpful error booleans are attached based on the error status code:
  *
  *   - 401 - `error.isUnauthenticated`:  the session isn't authenticated
  *   - 403 - `error.isForbidden`:  the session is authenticated but does not have
  *                         permission to perform the requested action
  *   - 404 - `error.isNotFound`:  the requested resource could not be found
  *   - 500 - `error.isServer`:  an internal server error occurred
  *
  * For an unknown error state, i.e error state not matching to the above defined list:
  *   - unknown - `error.isUnknown`:  an error occurred, but we don't know which or
  *                   we don't distinguish it yet
*/

const STATUS_MESSAGES = {
  '401' : {
    icon: 'disabled',
    title: 'errors.titles.unauthenticated-error',
    subtitle: 'errors.subtitles.unauthenticated-error',
    description: 'errors.descriptions.unauthenticated-error',
  },
  '403' : {
    icon: 'disabled',
    title: 'errors.titles.forbidden-error',
    subtitle: 'errors.subtitles.forbidden-error',
    description: 'errors.descriptions.forbidden-error',
  },
  '404' : {
    icon: 'help-circle-outline',
    title: 'errors.titles.notfound-error',
    subtitle: 'errors.subtitles.notfound-error',
    description: 'errors.descriptions.notfound-error',
  },
  '500' : {
    icon: 'alert-circle-outline',
    title: 'errors.titles.server-error',
    subtitle: 'errors.subtitles.server-error',
    description: 'errors.descriptions.server-error',
  },
  'unknown' : {
    icon: 'alert-circle-outline',
    title: 'errors.titles.unknown-error',
    subtitle: 'errors.subtitles.unknown-error',
    description: 'errors.descriptions.unknown-error',
  }
};

export default class ErrorMessageComponent extends Message {
  // =services

  @service intl;

  // @tracked error;

  // =methods

  /**
   * Returns an icon name based on error status.
   * @return {string}
   */
  get icon() {
    return this.statusMessage.icon;
  }

  /**
   * Returns a message title based on error status.
   * @return {string}
   */
  get title() {
    return this.intl.t(this.statusMessage.title);
  }

  /**
   * Returns a message subtitle of error status prefixed with 'Error'.
   * @return {string}
   */
  get subtitle() {
    return this.intl.t(this.statusMessage.subtitle);
  }

  /**
   * Returns an error description based on error status.
   * @return {string}
   */
  get description() {
    return this.intl.t(this.statusMessage.description);
  }

  /**
   * Returns an object with default index route and help text.
   * @return {object}
   */
  get help() {
    return {
      route: 'index',
      text: this.intl.t('actions.help')
    }
  }

  /**
   * Returns an object with message details based on error status.
   * Return message for `unkown` error when error status isn't part of
   * predefined message set.
   * @return {object}
   */
  get statusMessage() {
    let status = this.error.status;
    if(!STATUS_MESSAGES[status]) { status = 'unknown'; }
    return STATUS_MESSAGES[status];
  }
}
