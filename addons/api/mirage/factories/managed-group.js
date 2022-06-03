import factory from '../generated/factories/managed-group';
import { random } from 'faker';
import permissions from '../helpers/permissions';
import generateId from '../helpers/id';

const types = ['oidc'];

export default factory.extend({
  type: (i) => types[i % types.length],

  authorized_actions: () =>
    permissions.authorizedActionsFor('managed-group') || [
      'no-op',
      'read',
      'update',
      'delete',
    ],

  id: () => generateId('mg_'),

  attributes() {
    switch (this.type) {
      case 'oidc':
        return {
          filter: random.words(),
        };
    }
  },
});
