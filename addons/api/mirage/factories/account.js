import factory from '../generated/factories/account';
import { random, internet } from 'faker';

export default factory.extend({
  authorized_actions: () => ['no-op', 'read', 'update', 'delete'],
  attributes() {
    switch (this.type) {
      case 'password':
        return { login_name: random.words() };
      case 'oidc':
        return {
          issuer: internet.ip(),
          subject: 'sub',
          email: internet.email(),
          full_name: random.words(),
        };
    }
  },
});
