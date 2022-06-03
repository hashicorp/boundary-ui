import factory from '../generated/factories/account';
import { random, internet } from 'faker';
import permissions from '../helpers/permissions';
import generateId from '../helpers/id';

export default factory.extend({
  authorized_actions: () =>
    permissions.authorizedActionsFor('account') || [
      'no-op',
      'read',
      'update',
      'delete',
      'set-password',
    ],

  id: () => generateId('acct_'),

  attributes() {
    switch (this.type) {
      case 'password':
        return { login_name: random.words() };
      case 'oidc':
        return {
          issuer: internet.ip(),
          subject: 'sub',
          email: internet.email(),
          full_name: random.words(),
        };
    }
  },
});
