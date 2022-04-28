import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class ToolbarRefresherComponent extends Component {
  // =properties

  @tracked lastRefreshed = null;

  // =methods

  /**
   * Executes the click handler argument and trackes the time it completed.
   */
  @action
  async onClick() {
    await this.args.onClick();
    this.lastRefreshed = new Date();
  }
}
