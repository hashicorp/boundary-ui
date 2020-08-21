import { Model, belongsTo, hasMany } from 'ember-cli-mirage';

export default Model.extend({

  hostCatalog: belongsTo(),
  hostSet: hasMany()

});
