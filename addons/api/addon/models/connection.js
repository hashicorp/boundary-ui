import GeneratedConnectionModel from '../generated/models/connection';
import { belongsTo, hasMany } from '@ember-data/model';

export default class ConnectionModel extends GeneratedConnectionModel {
  @belongsTo('recording') recording;
  @hasMany('channel') channels;
}
