import factory from '../generated/factories/worker';
import permissions from '../helpers/permissions';
import generateId from '../helpers/id';
import { faker } from '@faker-js/faker';

const types = ['pki', 'kms'];

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
  canonical_tags: (i) => ({
    type: i % 2 === 0 ? ['dev', faker.random.word(), faker.random.word()] : [],
  }),
  config_tags: (i) => ({
    type: i % 2 === 0 ? ['dev', faker.random.word(), faker.random.word()] : [],
  }),
});
