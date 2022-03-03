import { belongsTo, hasMany } from 'ember-cli-mirage';
import Model from './default-model';

export default Model.extend({
  scope: belongsTo(),
  accounts: hasMany('account'),
});
