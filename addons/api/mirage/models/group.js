import { belongsTo, hasMany } from 'ember-cli-mirage';
import Model from './base';

export default Model.extend({
  scope: belongsTo(),
  members: hasMany('user'),
});
