import { Factory } from 'ember-cli-mirage';
import { random, date, datatype } from 'faker';

/**
 * GeneratedAuthMethodModelFactory
 */
export default Factory.extend({
  type: 'password',
  name: () => random.words(),
  description: () => random.words(),
  created_time: () => date.recent(),
  updated_time: () => date.recent(),
  disabled: () => datatype.boolean(),

  attributes: function () {
    let attrs;
    switch (this.type) {
      case 'oidc':
        attrs = {
          api_url_prefix: 'http://127.0.0.1:9200',
          callback_url:
            'http://127.0.0.1:9200/v1/auth-methods/oidc:authenticate:callback',
          client_id: 'YTwdJBB55LpKnuXb9n65',
          client_secret_hmac: 'GY7blb4ynM5TEPNi_qnphJ9aDWhW8FpmN3D-eP_L7Zk',
          issuer: 'http://127.0.0.1:57070',
          state: 'active-public',
        };
        break;
    }
    return attrs;
  },
});
