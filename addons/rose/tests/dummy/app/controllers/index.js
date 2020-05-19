import Controller from '@ember/controller';
import { action } from '@ember/object';

export default class IndexController extends Controller {
  @action
  selectChange(/*value*/) {
    // eslint-disable-next-line no-console
    //console.log(value);
  }
}
