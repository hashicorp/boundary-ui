import factory from '../generated/factories/worker';
import permissions from '../helpers/permissions';
import generateId from '../helpers/id';
import { random } from 'faker';

const types = ['pki', 'kms'];
const tags = ['dev', random.word(), random.word()];

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
