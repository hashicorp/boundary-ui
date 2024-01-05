import Controller from '@ember/controller';
import { inject as service } from '@ember/service';

export default class ScopesScopeHostsHostCatalogsHostCatalogHostSetsHostSetHostsController extends Controller {
  // =services
  @service intl;

  // =attributes
  /**
   * Returns the columns for the host list.
   * @type {Array.<object>}
   */
  get columns() {
    const commonColumns = [
      {
        label: this.intl.t('form.type.label'),
      },
      {
        label: this.intl.t('form.id.label'),
      },
    ];

    const staticColumns = [
      {
        label: this.intl.t('form.name.label'),
      },
      ...commonColumns,
      {
        label: this.intl.t('titles.actions'),
      },
    ];

    const dynamicColumns = [
      {
        label: this.intl.t('form.external_name.label'),
      },
      ...commonColumns,
      {
        label: '',
      },
    ];

    if (this.model.hostSet.isStatic) {
      return staticColumns;
    } else {
      return dynamicColumns;
    }
  }
}
