import GeneratedManagedGroupModel from '../generated/models/managed-group';
import { attr } from '@ember-data/model';
import { A } from '@ember/array';

export default class ManagedGroupModel extends GeneratedManagedGroupModel {
  // =attributes

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
}
