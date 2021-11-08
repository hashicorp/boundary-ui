import factory from '../generated/factories/managed-group';
import permissions from '../helpers/permissions';

export default factory.extend({
  id: (i) => `managed-groups-id-${i}`,

  authorized_actions: () =>
    permissions.authorizedActionsFor('managed-group') || [
      'no-op',
      'read',
      'update',
      'delete',
    ],
});
