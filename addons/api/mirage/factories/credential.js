import factory from '../generated/factories/credential';
import { faker } from '@faker-js/faker';
import permissions from '../helpers/permissions';
import generatedId from '../helpers/id';

export default factory.extend({
  id: () => generatedId('cred_'),
  type: 'username_password',
  authorized_actions: () =>
    permissions.authorizedActionsFor('credential') || [
      'no-op',
      'read',
      'update',
      'delete',
    ],
  attributes() {
    return {
      username: faker.random.word(),
    };
  },
});
