import factory from '../generated/factories/managed-groups';
import permissions from '../helpers/permissions';

const types = ['password', 'OIDC'];

export default factory.extend({
  id: (i) => `managed-groups-id-${i}`,
  type: (i) => types[i % types.length],

  authorized_actions: () =>
    permissions.authorizedActionsFor('managed-groups') || [
      'no-op',
      'read',
      'update',
      'delete',
    ],
});
