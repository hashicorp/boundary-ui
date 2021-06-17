import factory from '../generated/factories/auth-method';
import { trait } from 'ember-cli-mirage';

const types = ['password', 'oidc'];

export default factory.extend({
  id: (i) => `auth-method-id-${i}`,

  // Cycle through available types
  type: (i) => types[i % types.length],

  /**
   * Adds accounts (with associated users) to auth method.
   */
  withAccountsAndUsers: trait({
    afterCreate(authMethod, server) {
      const { scope, type } = authMethod;
      server.createList('user', 5, { scope }).map((user) => {
        const { id } = server.create('account', { scope, type, authMethod });
        user.update({ accountIds: [id] });
      });
    },
  }),
});
