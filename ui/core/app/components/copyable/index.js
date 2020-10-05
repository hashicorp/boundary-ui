import Component from '@glimmer/component';
import ClipboardJS from 'clipboard';
import { action } from '@ember/object';
import { generateComponentID } from 'rose/utilities/component-auto-id';
import { task, timeout } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';

export default class CopyableComponent extends Component {

  // =attributes

  id = generateComponentID();
  copyableButtonId = `copyable-button-${this.id}`;

  actionIcon = 'copy-action';
  successIcon = 'copy-success';
  actionText = this.args.buttonText;
  successText = this.args.acknowledgeText;

  @tracked copied = false;

  clipboard = null;

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
  /* istanbul ignore next */
  @task(function * () {
    this.copied = true;
    yield timeout(1000);
    this.copied = false;
  }).drop() confirmCopyTimer;

  /**
   * Checks for ClipboardJS support.
   * @return {boolean}
   */
  get isClipboardLibrarySupported() {
    return ClipboardJS.isSupported();
  }

  // =actions

  /**
   * Initialize ClipboardJS library and register for it's events.
   */
  @action
  register() {
    this.destroy();
    /* istanbul ignore next */
    this.clipboard = new ClipboardJS(`#${this.copyableButtonId}`, {
      text: () => this.args.text,
    });
    /* istanbul ignore next */
    this.clipboard.on('success', (clipboardEvent) => {
      clipboardEvent.clearSelection();
      this.confirmCopyTimer.perform();
    });
  }

  /**
   * Destroy ClipboardJS library instance and cancel icon timer.
   */
  @action
  destroy() {
    this.clipboard?.destroy();
    this.clipboard = null;
    this.confirmCopyTimer.cancelAll();
  }

}
