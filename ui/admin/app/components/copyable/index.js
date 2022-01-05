import Component from '@glimmer/component';
import ClipboardJS from 'clipboard';
import { action } from '@ember/object';
import { generateComponentID } from 'rose/utilities/component-auto-id';
import { tracked } from '@glimmer/tracking';
import { later } from '@ember/runloop';

export default class CopyableComponent extends Component {
  // =attributes

  id = generateComponentID();
  copyableButtonId = `copyable-button-${this.id}`;

  actionIcon = 'flight-icons/svg/clipboard-copy-16';
  successIcon = 'flight-icons/svg/clipboard-checked-16';
  actionText = this.args.buttonText;
  successText = this.args.acknowledgeText;

  @tracked copied = false;

  clipboard = null;

  confirmCopy() {
    this.copied = true;
    later(() => (this.copied = false), 1000);
  }

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
    this.tearDown();
    /* istanbul ignore next */
    this.clipboard = new ClipboardJS(`#${this.copyableButtonId}`, {
      text: () => this.args.text,
    });
    /* istanbul ignore next */
    this.clipboard.on('success', (clipboardEvent) => {
      clipboardEvent.clearSelection();
      this.confirmCopy();
    });
  }

  /**
   * Destroy ClipboardJS library instance and cancel icon timer.
   */
  @action
  tearDown() {
    this.clipboard?.destroy();
    this.clipboard = null;
  }
}
