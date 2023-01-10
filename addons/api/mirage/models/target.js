import Model from './base';
import { belongsTo, hasMany } from 'miragejs';

export default Model.extend({
  scope: belongsTo(),
  hostSets: hasMany(),
});
