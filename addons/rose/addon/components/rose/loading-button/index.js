import button from '../button/index';

import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class LoadingButton extends button {
  // =actions
  @tracked isLoading = false;

  @action
  async toggleRefresh() {
    this.isLoading = true;
    try {
      await this.args.onClick();
    } catch (e) {
      console.error('Error while loading data', e);
    }
    this.isLoading = false;
  }
}
