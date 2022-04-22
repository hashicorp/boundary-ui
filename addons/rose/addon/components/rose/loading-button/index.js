import button from '../button/index';

import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class LoadingButton extends button {
  // =actions
  @tracked isLoading = false;

  @action
  //on click of refresh btn, make a call to api..
  //show the loading icon
  //after it is done loading the results, show the refresh back and
  //let users to refresh again..

  //NOTE: do not let users to keep clicking the btn
  async toggleRefresh() {
    this.isLoading = true;
    await this.args.onClick();
    try {
      this.isLoading = false;
    } catch (e) {
      //todo: what goes here, really?
      throw new Error('error refreshing sessions');
    }
  }
}
