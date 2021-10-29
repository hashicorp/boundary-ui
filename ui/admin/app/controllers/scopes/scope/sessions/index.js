import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
const possibleItems = [
  { id: 1, name: 'foo' },
  { id: 2, name: 'bar' },
  { id: 3, name: 'baz' },
];

export default class ScopesScopeSessionsIndexController extends Controller {
  // =services

  @service intl;
  @tracked items = [...possibleItems];

  @tracked selectedItems = [ possibleItems[2] ]

}
