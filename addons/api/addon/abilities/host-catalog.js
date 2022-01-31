import ModelAbility from './model';

/**
 * Provides abilities for host catalogs.
 */
export default class HostCatalogAbility extends ModelAbility {
  // =permissions

  /**
   * Only "known" host catalog types may be read.
   * @type {boolean}
   */
  get canRead() {
    return !this.model.isUnknown && this.hasAuthorizedAction('read');
  }
}
