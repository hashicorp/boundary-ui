import { belongsTo, hasMany } from 'miragejs';
import Model from './base';

export default Model.extend({
  scope: belongsTo(),
  users: hasMany(),
  groups: hasMany(),
});
