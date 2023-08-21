import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class ScopesScopeProjectsSessionsSessionController extends Controller {
  @tracked isRawApiVisible = false;

  @action
  toggleCredentials() {
    this.isRawApiVisible = !this.isRawApiVisible;
  }
}
