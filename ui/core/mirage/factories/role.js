import factory from '../generated/factories/role';

export default factory.extend({

  // eslint-disable-next-line ember/avoid-leaking-state-in-ember-objects
  grants: [
    'id=*;action=*',
    'id=*;type=host-catalog;actions=create,read'
  ],

});
