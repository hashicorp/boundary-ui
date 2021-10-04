import factory from '../generated/factories/user';
import permissions from '../helpers/permissions';

export default factory.extend({
  authorized_actions: () =>
    permissions.authorizedActionsFor('user') || [
      'no-op',
      'read',
      'update',
      'delete',
      'add-accounts',
      'remove-accounts',
    ],
  id: (i) => `user-${i}`,
});
