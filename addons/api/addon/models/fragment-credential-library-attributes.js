import Fragment from 'ember-data-model-fragments/fragment';
import { attr } from '@ember-data/model';
import { options } from './credential-library';

export default class FragmentCredentialLibraryAttributesModel extends Fragment {
  //= attributes (vault)

  @attr('string', {
    description:
      'The HTTP method the library uses when requesting credentials from Vault.',
    defaultValue: () => options.http_method[0],
  })
  http_method;

  @attr('string', {
    description:
      'The body of the HTTP request the library sends to Vault when requesting credentials. Only valid if `http_method` is set to `POST`.',
  })
  http_request_body;

  @attr('string', {
    description: 'The path in Vault to request credentials from.',
  })
  path;
}
