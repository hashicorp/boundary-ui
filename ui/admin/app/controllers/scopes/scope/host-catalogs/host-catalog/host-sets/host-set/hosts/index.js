import Controller from '@ember/controller';
import { inject as service } from '@ember/service';

export default class ScopesScopeHostsHostCatalogsHostCatalogHostSetsHostSetHostsController extends Controller {
  // =services
  @service intl;

  // =attributes
  /**
   * Returns the static columns header labels for the table
   * @type {Array.<object>}
   */
  get isStaticColumns() {
    return [
      {
        label: this.intl.t('form.name.label'),
      },
      {
        label: this.intl.t('form.type.label'),
      },
      {
        label: this.intl.t('form.id.label'),
      },
      {
        label: this.intl.t('titles.actions'),
      },
    ];
  }

  /**
   * Returns the dynamic columns header labels for the table
   * @type {Array.<object>}
   */
  get isDynamicColumns() {
    return [
      {
        label: this.intl.t('form.external_name.label'),
      },
      {
        label: this.intl.t('form.type.label'),
      },
      {
        label: this.intl.t('form.id.label'),
      },
    ];
  }
}
