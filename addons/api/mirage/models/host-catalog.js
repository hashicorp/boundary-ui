import { belongsTo, hasMany } from 'miragejs';
import Model from './base';

export default Model.extend({
  scope: belongsTo(),
  hostSets: hasMany(),
});
