import { getOwner } from '@ember/application';

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
      const notifyService = owner.lookup('service:notify');
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
      notifyService.success(text);
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
 * @param {object} options.catch - defaults to false
 */
export function notifyError(notification, options = { catch: false }) {
  return function (_target, _propertyKey, desc) {
    const method = desc.value;
    desc.value = async function () {
      const owner = getOwner(this);
      const notifyService = owner.lookup('service:notify');
      const intlService = owner.lookup('service:intl');

      try {
        return await method.apply(this, arguments);
      } catch (error) {
        const candidateKey =
          typeof notification === 'function'
            ? notification.apply(this, [error])
            : notification;

        const text = intlService.exists(candidateKey)
          ? intlService.t(candidateKey)
          : candidateKey;

        notifyService.error(text, { closeAfter: null });

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
