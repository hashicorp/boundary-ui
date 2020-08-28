import factory from '../generated/factories/user';

export default factory.extend({
  id: (i) => `user-${i}`
});
