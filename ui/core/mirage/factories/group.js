import factory from '../generated/factories/group';
import { trait } from 'ember-cli-mirage';

export default factory.extend({
  id: (i) => `group-${i}`,

  /**
   * Generates some users for the same scope and assigns them to the group
   * as members.
   */
  withMembers: trait({
    afterCreate(group, server) {
      const scope = group.scope;
      const scopePojo = { id: scope.id, type: scope.type };
      const members = server.createList('user', 2, { scope: scopePojo });
      group.update({ members });
    }
  })
});
