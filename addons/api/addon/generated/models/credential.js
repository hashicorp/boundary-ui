import BaseModel from '../../models/base';
import { attr } from '@ember-data/model';

/**
 * A credential is a data structure containing one or more secrets that binds an
 * identity to a set of permissions or capabilities on a host for a session.
 */
export default class GeneratedCredentialModel extends BaseModel {
  // =attributes

  @attr('string', {
    description:
      'The ID of the Credential Store of which this Credential is a part.',
  })
  credential_store_id;

  @attr('string', {
    description: 'The type of the resource, to help differentiate schemas',
  })
  type;

  @attr('string', {
    description: 'Optional name for identification purposes',
  })
  name;

  @attr('string', {
    description: 'Optional user-set description for identification purposes',
  })
  description;

  @attr('date', {
    description: 'The time this resource was created\nOutput only.',
    readOnly: true,
  })
  created_time;

  @attr('date', {
    description: 'The time this resource was last updated\nOutput only.',
    readOnly: true,
  })
  updated_time;

  @attr('number', {
    description: 'Current version number of this resource.',
  })
  version;

  // =attributes (username_password)
  // @attr('string', {
  //   for: 'username_password',
  //   isNestedAttribute: true,
  //   description: 'The password hmac for credential.',
  // })
  // password_hmac;

  @attr('string', {
    for: 'username_password',
    isNestedAttribute: true,
    description: 'The password for credential.',
  })
  password;

  @attr('string', {
    for: 'username_password',
    isNestedAttribute: true,
    description: 'The username for credential.',
  })
  username;
}
