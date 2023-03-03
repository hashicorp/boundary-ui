import { belongsTo } from 'miragejs';
import Model from './base';
export default Model.extend({
  scope: belongsTo(),
});
