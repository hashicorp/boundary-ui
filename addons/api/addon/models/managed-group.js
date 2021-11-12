import GeneratedManagedGroupModel from '../generated/models/managed-group';
import { attr } from '@ember-data/model';
import { fragment } from 'ember-data-model-fragments/attributes';
import { A } from '@ember/array';

export default class ManagedGroupModel extends GeneratedManagedGroupModel {
  // =attributes

  // =error attributes
  // These attributes exist solely to capture errors on nested fields.
  // See the application adapter's error normalization method for
  // more information.

  @attr('string', { readOnly: true }) attributes_filter;

  /**
   * Members is read-only under normal circumstances.  But members can
   * be persisted via calls to `addMembers()` or `removeMembers()`.
   */
  @attr({
    readOnly: true,
    defaultValue: () => A(),
    emptyArrayIfMissing: true,
  })
  member_ids;

  @fragment('fragment-managed-group-attributes', { defaultValue: {} })
  attributes;
}
