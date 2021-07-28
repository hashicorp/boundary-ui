import factory from '../generated/factories/credential-library';
import { random, system } from 'faker';

const types = ['vault'];

export default factory.extend({
  id: (i) => `credential-library-id-${i}`,
  type: (i) => types[i % types.length],

  attributes() {
    switch (this.type) {
      case 'vault':
        return {
          http_method: 'GET',
          http_request_body: random.word(),
          path: system.directoryPath(),
        };
    }
  },
});
