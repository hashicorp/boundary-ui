import { trait } from 'ember-cli-mirage';
import factory from '../generated/factories/role';

export default factory.extend({

  // eslint-disable-next-line ember/avoid-leaking-state-in-ember-objects
  grants: ['id=*;action=*'],

  /**
   * Create roles `withRelated` to also generate related users and groups.
   */
  withRelated: trait({
    afterCreate(record, server) {
      record.update({
        user_ids: server.createList('user', 3).map(user => user.id),
        group_ids: server.createList('group', 3).map(group => group.id)
      });
    }
  })

});
