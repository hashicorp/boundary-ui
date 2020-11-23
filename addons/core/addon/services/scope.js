import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';

/**
 * This simple non-functional service is used to retain references to
 * the current active scope(s).
 */
export default class ScopeService extends Service {
  // =attributes

  /**
   * @type {ScopeModel}
   */
  @tracked org;

  /**
   * @type {ScopeModel}
   */
  @tracked project;
}
