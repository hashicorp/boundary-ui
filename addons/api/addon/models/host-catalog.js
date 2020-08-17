import GeneratedHostCatalogModel from '../generated/models/host-catalog';
import { hasMany } from '@ember-data/model';

export default class HostCatalogModel extends GeneratedHostCatalogModel {

  /**
   * @type {HostSetModel[]}
   */
  @hasMany('host-set') hostSets;

}
