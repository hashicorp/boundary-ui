import Component from '@glimmer/component';
import ClipboardJS from 'clipboard';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { generateComponentID } from 'rose/utilities/component-auto-id';
import { task, timeout } from 'ember-concurrency';
import { set } from '@ember/object';
import { bind } from '@ember/runloop';

export default class CopyableComponent extends Component {

  // =attributes

  id = generateComponentID();
  icon = 'copy-action';

  @tracked clipboard;

  /**
   * A Ember Concurrency-based task that updates copy icon to a success state
   * and back after 1 second. This icon flash indicates success on
   * copy to clipboard action.
   *
   * NOTE:  tasks are sort of attributes and sort of methods, but they are not
   * language-level constructs.  Thus we annotate this task as if it
   * is an attribute.
   * @type {Task}
   */
  @task(function * () {
    set(this, 'icon', 'copy-success');
    yield timeout(1000);
    set(this, 'icon', 'copy-action');
  }).drop() successIconTimer;

  // =methods

  /**
   * Checks for ClipboardJS support.
   * @return {boolean}
   */
  get isClipboardLibrarySupported() {
    return ClipboardJS.isSupported();
  }

  /**
   * When copy to clipboard is successful, begin timer to show success icon.
   */
  onCopySuccess(clipboardEvent) {
    clipboardEvent.clearSelection();
    this.successIconTimer.perform();
  }

  // =actions

  /**
   * Initialize ClipboardJS library and register for it's events.
   */
  @action
  register() {
    if(!this.clipboard) {
      this.clipboard = new ClipboardJS('.copyable-button');
      this.clipboard.on('success', bind(this, this.onCopySuccess));
    }
  }

  /**
   * Destroy ClipboardJS library instance and cancel icon timer.
   */
  @action
  destroy() {
    this.clipboard?.destroy();
    this.successIconTimer.cancelAll();
  }

}
