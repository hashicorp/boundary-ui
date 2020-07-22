import Fragment from 'ember-data-model-fragments/fragment';
import { computed } from '@ember/object';
import { attr } from '@ember-data/model';
import { scopeTypes } from './scope';

export default class FragmentParentScope extends Fragment {

  // =attributes

  @attr('string', {
    description: 'ID of the related scope'
  }) scope_id;

  @attr('string', {
    description: 'The type of the resource'
  }) type;

  /**
   * @type {boolean}
   */
  @computed('type')
  get isGlobal() { return this.type === scopeTypes.global; }

  /**
   * @type {boolean}
   */
  @computed('type')
  get isOrg() { return this.type === scopeTypes.org; }

  /**
   * @type {boolean}
   */
  @computed('type')
  get isProject() { return this.type === scopeTypes.project; }

}
