import Controller from '@ember/controller';

export default class ScopesScopeAuthMethodsIndexController extends Controller {
  get hasPrimaryAuthMethod() {
    return this.model.filterBy('isPrimary');
  }
}
