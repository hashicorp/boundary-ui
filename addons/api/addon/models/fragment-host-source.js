import Fragment from 'ember-data-model-fragments/fragment';
import { attr } from '@ember-data/model';

export default class FragmentHostSourceModel extends Fragment {
  // =attributes

  @attr('string', {
    description: 'ID of the related host source',
  })
  host_source_id;

  @attr('string', {
    description: 'ID of the catalog to which the host set belongs',
  })
  host_catalog_id;
}
