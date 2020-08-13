import Fragment from 'ember-data-model-fragments/fragment';
import { attr } from '@ember-data/model';

export default class FragmentPrincipal extends Fragment {

  // =attributes

  @attr('string', {
    description: 'ID of the related scope'
  }) scope_id;

  @attr('string', {
    description: 'ID of the related principal (user or group)'
  }) principal_id;

  @attr('string', {
    description: 'Type of the related principal (user or group)'
  }) type;

}
