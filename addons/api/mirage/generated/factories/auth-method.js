/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { Factory } from 'miragejs';
import { faker } from '@faker-js/faker';

import {
  TYPE_AUTH_METHOD_PASSWORD,
  TYPE_AUTH_METHOD_OIDC,
  TYPE_AUTH_METHOD_LDAP,
} from 'api/models/auth-method';

/**
 * GeneratedAuthMethodModelFactory
 */
export default Factory.extend({
  type: TYPE_AUTH_METHOD_PASSWORD,
  name: () => faker.random.words(),
  description: () => faker.random.words(),
  created_time: () => faker.date.recent(),
  updated_time: () => faker.date.recent(),
  disabled: () => faker.datatype.boolean(),

  attributes: function () {
    let attrs;
    switch (this.type) {
      case TYPE_AUTH_METHOD_OIDC:
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
      case TYPE_AUTH_METHOD_LDAP:
        attrs = {
          state: 'active-public',
          urls: [`ldap://${faker.internet.domainName()}`],
          certificates: [faker.random.alphaNumeric(50)],
          client_certificate: faker.random.alphaNumeric(50),
          certificate_key: `---Begin Certificate --- ${faker.random.alphaNumeric(
            170
          )} ---End Certificate ---`,
          certificate_key_hmac: faker.random.alphaNumeric(50),
          enable_groups: true,
          start_tls: false,
          insecure_tls: false,
          bind_dn: 'cn=read-only-admin,dc=example,dc=com',
          bind_password: 'password',
          bind_password_hmac: faker.random.alphaNumeric(50),
          upn_domain: 'example.com',
          discover_dn: false,
          anon_group_search: false,
          user_dn: 'dc=example,dc=com',
          user_attr: 'uid',
          user_filter: 'uid=username',
          group_dn: 'dc=example,dc=com',
          group_attr: 'cn',
          group_filter: 'member=dn',
          account_attribute_maps: [
            'preferredName=fullName',
            'preferredEmail=email',
          ],
        };
        break;
    }
    return attrs;
  },
});
