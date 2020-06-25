import Controller from '@ember/controller';
import { alias } from '@ember/object/computed';

export default class OrgsOrgProjectsProjectHostCatalogsHostCatalogController extends Controller {

  // =attributes

  /**
   * @type {string}
   */
  @alias('model.displayName') breadCrumb;

}
