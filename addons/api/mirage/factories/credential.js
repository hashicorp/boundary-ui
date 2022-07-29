import factory from '../generated/factories/credential';
import { random } from 'faker';
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
      username: random.word(),
    };
  },
});
