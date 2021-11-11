import factory from '../generated/factories/managed-group';
import { random } from 'faker';
import permissions from '../helpers/permissions';

const types = ['oidc'];

export default factory.extend({
  id: (i) => `managed-groups-id-${i}`,
  type: (i) => types[i % types.length],

  authorized_actions: () =>
    permissions.authorizedActionsFor('managed-group') || [
      'no-op',
      'read',
      'update',
      'delete',
    ],

  attributes() {
    switch (this.type) {
      case 'oidc':
        return {
          filter: random.words(),
        };
    }
  },
});
