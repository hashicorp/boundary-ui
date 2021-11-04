import GeneratedManagedGroupModel from '../generated/models/managed-group';
import { attr } from '@ember-data/model';
import { fragment } from 'ember-data-model-fragments/attributes';

export default class ManagedGroupModel extends GeneratedManagedGroupModel {
  // =error attributes
  @attr('string', { readOnly: true }) filter;

  // =attributes
  @fragment('fragment-managed-group-attributes', { defaultValue: {} })
  attributes;
}
