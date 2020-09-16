import factory from '../generated/factories/auth-method';
import { trait } from 'ember-cli-mirage';

export default factory.extend({
  id: (i) => `auth-method-id-${i}`,

  /**
   * Adds accounts to auth method.
   */
  withAccounts: trait({
    afterCreate(authMethod, server) {
      const { scope } = authMethod;
      server.createList('account', 5, { scope, authMethod });
    }
  })

});
