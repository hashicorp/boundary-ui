import { belongsTo, hasMany } from 'ember-cli-mirage';
import Model from './base';

export default Model.extend({
  scope: belongsTo(),
  users: hasMany(),
  groups: hasMany(),
});
