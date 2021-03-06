import { Model, belongsTo, hasMany } from 'ember-cli-mirage';

export default Model.extend({
  scope: belongsTo(),
  accounts: hasMany('account'),
});
