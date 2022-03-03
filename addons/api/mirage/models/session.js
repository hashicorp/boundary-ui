import { belongsTo } from 'ember-cli-mirage';
import Model from './default-model';

export default Model.extend({
  scope: belongsTo(),
  user: belongsTo(),
  target: belongsTo(),
  host: belongsTo(),
  hostSet: belongsTo(),
});
