import factory from '../generated/factories/host';

export default factory.extend({
  id: (i) => `host-id-${i}`,
});
