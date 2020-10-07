import { getOwner } from '@ember/application';

/**
 * Decorates a method whereby calls to the method will first request
 * confirmation via the confirmation service.  If the user accepts, the
 * original method is executed.  If the user denies, it is not.
 */
export function confirm(confirmationTextKey) {
  return function (_target, _propertyKey, desc) {
    const method = desc.value;
    desc.value = function () {
      const owner = getOwner(this);
      const confirmService = owner.lookup('service:confirm');
      const intl = owner.lookup('service:intl');
      const text = intl.t(confirmationTextKey);
      return confirmService.confirm(text)
        // If user confirmed, execute the decorated method
        .then(() => method.apply(this, arguments))
        // If the user denied, gracefully handle promise rejection with no-op
        .catch(() => {});
    };
  }
}
