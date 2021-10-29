import GeneratedManagedGroupModel from '../generated/models/managed-groups';
import { attr } from '@ember-data/model';
import { fragment } from 'ember-data-model-fragments/attributes';

export default class ManagedGroupsModel extends GeneratedManagedGroupModel {
  // =error attributes
  @attr('string', { readOnly: true }) filter;

  // =attributes
  @fragment('fragment-managed-groups-attributes', { defaultValue: {} })
  attributes;
}
