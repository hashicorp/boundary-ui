import Fragment from 'ember-data-model-fragments/fragment';
import { attr } from '@ember-data/model';

export default class FragmentCredentialLibraryModel extends Fragment {
  // =attributes

  @attr('string', {
    description: 'ID of the related credential library',
  })
  credential_library_id;
}
