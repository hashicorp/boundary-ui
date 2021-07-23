import { Model, belongsTo, hasMany } from 'ember-cli-mirage';

export default Model.extend({
  scope: belongsTo(),
  hostSets: hasMany(),
  credentialLibraries: hasMany(),
});
