import { Model, belongsTo } from 'ember-cli-mirage';

export default Model.extend({

  scope: belongsTo(),
  user: belongsTo(),
  target: belongsTo(),
  host: belongsTo(),
  hostSet: belongsTo(),

});
