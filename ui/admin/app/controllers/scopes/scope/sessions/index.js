import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
export default class ScopesScopeSessionsIndexController extends Controller {
  // =services

  @service intl;
  @tracked selectedItems;
}
