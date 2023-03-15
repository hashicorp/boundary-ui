/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { Factory } from 'miragejs';
import { faker } from '@faker-js/faker';
import * as fakeData from '../../helpers/fake-data';

/**
 * GeneratedAuthMethodModelFactory
 */
export default Factory.extend({
  type: 'password',
  name: () => fakeData.name(),
  description: () => faker.random.words(),
  created_time: () => faker.date.recent(),
  updated_time: () => faker.date.recent(),
  disabled: () => faker.datatype.boolean(),

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
          max_age: 1800,
          disable_discovered_config_validation: false,
          state: 'active-public',
          account_claim_maps: ['oid=sub', 'full_name=name'],
          claims_scopes: ['profile', 'email'],
          signing_algorithms: ['RS256', 'RS384'],
          allowed_audiences: ['www.alice.com', 'www.alice.com/admin'],
          idp_ca_certs: ['certificate-1234', 'certificate-5678'],
        };
        break;
    }
    return attrs;
  },
});
