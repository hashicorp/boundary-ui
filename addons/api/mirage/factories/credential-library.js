import factory from '../generated/factories/credential-library';
import { random, system } from 'faker';

export default factory.extend({
  id: (i) => `credential-library-id-${i}`,

  attributes() {
    return {
      http_method: 'GET',
      http_request_body: random.word(),
      path: system.directoryPath(),
    };
  },
});
