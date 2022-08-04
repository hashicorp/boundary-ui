import factory from '../generated/factories/session';
import { trait } from 'ember-cli-mirage';
import { faker } from '@faker-js/faker';
import generateId from '../helpers/id';

const statusStrings = ['pending', 'active', 'canceling', 'terminated'];

export const pickRandomStatusString = () =>
  faker.helpers.arrayElement(statusStrings);

export default factory.extend({
  id: () => generateId('ss_'),

  status: pickRandomStatusString,

  /**
   * Sessions generated with this trait will automatically form
   * associations to user, target, host set, and host (if available) within
   * the current scope.
   */
  withAssociations: trait({
    afterCreate(record, server) {
      const scopeId = record.scopeId;
      if (record.scope.type === 'project') {
        const orgScopeId = record.scope?.scope.id;
        const user = server.schema.users.where({ scopeId: orgScopeId })
          .models[0];
        if (user) record.update({ user });
      }
      const target = server.schema.targets.where({ scopeId }).models[0];
      if (target) {
        record.update({ target });
        const hostSet = target.hostSets.models[0];
        if (hostSet) {
          record.update({ hostSet });
          const host = hostSet.hosts.models[0];
          if (host) record.update({ host });
        }
      }
    },
  }),
});
