import { Model, belongsTo, hasMany } from 'ember-cli-mirage';

export default Model.extend({
  scope: belongsTo(),
  users: hasMany(),
  groups: hasMany(),
});
