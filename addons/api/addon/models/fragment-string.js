import Fragment from 'ember-data-model-fragments/fragment';
import { attr } from '@ember-data/model';

/**
 * Represents an item in an array of strings.
 */
export default class FragmentStringModel extends Fragment {

  // =attributes

  @attr('string', {
    description: 'The value of the string.'
  })
  value;

}
