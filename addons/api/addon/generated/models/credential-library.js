import BaseModel from '../../models/base';
import { attr } from '@ember-data/model';

/**
 * A credential library is a resource that can generate and retrieve
 * credentials.
 */
export default class GeneratedCredentialLibraryModel extends BaseModel {
  // =attributes

  @attr('string', {
    description: 'The type of the resource, to help differentiate schemas',
  })
  type;

  @attr('string', {
    description: 'The owning credential store ID.',
  })
  credential_store_id;

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

  //= attributes (vault)

  @attr('string', {
    isNestedAttribute: true,
    description:
      'The HTTP method the library uses when requesting credentials from Vault.',
    defaultValue: () => 'GET',
  })
  http_method;

  @attr('string', {
    isNestedAttribute: true,
    description:
      'The body of the HTTP request the library sends to Vault when requesting credentials. Only valid if `http_method` is set to `POST`.',
  })
  http_request_body;

  @attr('string', {
    isNestedAttribute: true,
    description: 'The path in Vault to request credentials from.',
  })
  path;
}
