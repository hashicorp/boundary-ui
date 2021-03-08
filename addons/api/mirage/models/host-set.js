import { Model, belongsTo, hasMany } from 'ember-cli-mirage';

export default Model.extend({
  scope: belongsTo(),
  target: belongsTo(),
  hostCatalog: belongsTo(),
  hosts: hasMany(),
});
