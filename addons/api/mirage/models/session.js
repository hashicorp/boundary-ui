import { belongsTo } from 'ember-cli-mirage';
import Model from './base';

export default Model.extend({
  scope: belongsTo(),
  user: belongsTo(),
  target: belongsTo(),
  host: belongsTo(),
  hostSet: belongsTo(),
});
