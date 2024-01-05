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
    if (this.model.hostSet.isStatic) {
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
    } else {
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
}
