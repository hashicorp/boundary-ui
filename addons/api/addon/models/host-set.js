import GeneratedHostSetModel from '../generated/models/host-set';
import { belongsTo } from '@ember-data/model';

export default class HostSetModel extends GeneratedHostSetModel {

  // =relationships

  /**
   * @type {HostCatalogModel}
   */
  @belongsTo('host-catalog') hostCatalog;

}
