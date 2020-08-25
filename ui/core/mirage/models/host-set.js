import { Model, belongsTo, hasMany } from 'ember-cli-mirage';

export default Model.extend({

  target: belongsTo(),
  hostCatalog: belongsTo(),
  hosts: hasMany()

});
