import button from '../button/index';

import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class LoadingButton extends button {
  // =actions
  @tracked isLoading = false;

  @action
  async toggleRefresh() {
    this.isLoading = true;
    await this.args.onClick();
    try {
      this.isLoading = false;
    } catch (e) {
      throw new Error('error refreshing sessions');
    }
  }
}
