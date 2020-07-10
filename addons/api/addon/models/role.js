import GeneratedRoleModel from '../generated/models/role';
import { fragmentArray } from 'ember-data-model-fragments/attributes';

export default class RoleModel extends GeneratedRoleModel {

  // =attributes

  @fragmentArray('fragment-string', {readOnly: true}) user_ids;
  @fragmentArray('fragment-string', {readOnly: true}) group_ids;
  @fragmentArray('fragment-string', {readOnly: true}) grants;

}
