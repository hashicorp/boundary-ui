/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { getOwner } from '@ember/application';

const { __electronLog } = globalThis;

/**
 * Decorates a method and, if the method does not error, shows a success
 * notification via the notify service.  The text of the notification is derived
 * from the argument `notification`, which may be either a string or a function
 * that returns a string.  This string may optionally be an intl key.
 * @param {string|function} notification
 */
export function notifySuccess(notification) {
  return function (_target, _propertyKey, desc) {
    const method = desc.value;
    desc.value = async function () {
      const owner = getOwner(this);
      const notifyService = owner.lookup('service:flashMessages');
      const intlService = owner.lookup('service:intl');
      const candidateKey =
        typeof notification === 'function'
          ? notification.apply(this, arguments)
          : notification;
      // As of now, we only use translated strings for notifications,
      // but this code would support both translated and arbitrary strings.
      // const text = intlService.exists(candidateKey)
      //   ? intlService.t(candidateKey)
      //   : candidateKey;
      const text = intlService.t(candidateKey);
      const value = await method.apply(this, arguments);
      notifyService.success(text, {
        color: 'success',
        title: intlService.t('states.success'),
        dismiss: (flash) => flash.destroyMessage(),
      });
      return value;
    };
  };
}

/**
 * Decorates a method and, if the method errors, shows an error
 * notification via the notify service.  The text of the notification is derived
 * from the argument `notification`, which may be either a string or a function
 * that returns a string.  This string may optionally be an intl key.
 *
 * If `options.catch` is `true`, any error occurring in the decorated method
 * will be rethrown after notification.  The default is to rethrow errors.
 *
 * @param {string|function} notification
 * @param {object} options
 * @param {boolean} options.sticky - defaults to true, whether or not to persist
 *                                  the notification until user dismissal
 * @param {boolean} options.catch - defaults to false, whether or not to catch
 *                                 and squelch the error
 * @param {object} options.log - defaults to undefined, object with unique
 *                              information about the error to send to our
 *                              electron logging service
 * @param {string} options.log.origin - defaults to undefined, the origin that
 *                                     triggered the error
 * @param {string} options.log.level - defaults to undefined, the log level that
 *                                     our electron logging service should use
 */
export function notifyError(
  notification,
  options = { catch: false, sticky: true },
) {
  return function (_target, _propertyKey, desc) {
    const method = desc.value;
    desc.value = async function () {
      const owner = getOwner(this);
      const notifyService = owner.lookup('service:flashMessages');
      const intlService = owner.lookup('service:intl');

      try {
        return await method.apply(this, arguments);
      } catch (error) {
        if (options.log) {
          const { origin, level = 'error' } = options.log;
          __electronLog?.[level](`${origin}:`, error.message);
        }
        const candidateKey =
          typeof notification === 'function'
            ? notification.apply(this, [error])
            : notification;

        const text = intlService.exists(candidateKey)
          ? intlService.t(candidateKey)
          : candidateKey;

        // Default is `true`.  Since `options` is a new object instance
        // when passed, the values shown in the signature aren't
        // true defaults.  For example, if a value `{ catch: true }` were
        // passed, `sticky` would actually be falsy, even though the intended
        // default is `true`.  Hence this extra step.
        const sticky = options.sticky === undefined ? true : options.sticky;

        notifyService.danger(text, {
          color: 'critical',
          title: intlService.t('states.error'),
          sticky,
          dismiss: (flash) => flash.destroyMessage(),
        });

        if (options.catch) {
          // squelch the error
        } else {
          // rethrow the error
          throw error;
        }
      }
    };
  };
}
