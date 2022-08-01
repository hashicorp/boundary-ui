import factory from '../generated/factories/user';
import permissions from '../helpers/permissions';
import generateId from '../helpers/id';
import { faker } from '@faker-js/faker';

const types = ['pki', 'kms'];
const tags = ['dev', faker.random.word(), faker.random.word()];

export default factory.extend({
  id: () => generateId('w_'),
  authorized_actions: () =>
    permissions.authorizedActionsFor('worker') || [
      'no-op',
      'read',
      'update',
      'delete',
    ],
  type: (i) => types[i % types.length],
  canonical_tags: () => ({
    type: tags,
  }),
  config_tags: () => ({
    type: tags,
  }),
});
