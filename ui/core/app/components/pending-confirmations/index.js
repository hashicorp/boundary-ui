import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

/**
 * A component that yields for each pending confirmation in the confirmations
 * service, passing the confirmation instance, a confirm action, and a dismiss
 * action. Useful for rendering confirm modals and awaiting user action.
 */
export default class PendingConfirmationsComponent extends Component {
  // =services

  @service confirm;

  // =actions

  /**
   * Accepts the passed confirmation.
   * @param {Confirmation} confirmation
   * @return {Confirmation}
   */
  @action
  accept(confirmation) {
    confirmation.confirm();
    return confirmation;
  }

  /**
   * Denies the passed confirmation.
   * @param {Confirmation} confirmation
   * @return {Confirmation}
   */
  @action
  deny(confirmation) {
    confirmation.dismiss();
    return confirmation;
  }
}
