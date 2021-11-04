import factory from '../generated/factories/managed-groups';
import permissions from '../helpers/permissions';

export default factory.extend({
  id: (i) => `managed-groups-id-${i}`,

  authorized_actions: () =>
    permissions.authorizedActionsFor('managed-groups') || [
      'no-op',
      'read',
      'update',
      'delete',
    ],

  authorized_collection_actions: () => {
    return {
      accounts: ['create', 'list'],
    };
  },
});
