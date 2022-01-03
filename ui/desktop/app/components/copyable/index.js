import Component from '@glimmer/component';
import ClipboardJS from 'clipboard';
import { action } from '@ember/object';
import { getOwner } from '@ember/application';
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

  // =methods

  /**
   * Returns the first element with the specified class name if exists,
   * otherwise undefined.
   * @return {?HTMLElement}
   */
  getFirstElementByClassName(className) {
    const document = getOwner(this).lookup('service:-document').documentElement;
    return document.getElementsByClassName(className)[0];
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
      // ClipboardJS depends on inserting a hidden textarea that receives
      // focus in order to copy text to the clipboard.  However, our modal
      // has a focus trap that prevents this focus.  Thus we try to set the
      // container to a modal (if exists), since this is the only container
      // a user would be able to interact with.  If a modal doesn't exist,
      // container is set to `undefined` and thus uses the default body element.
      container: this.getFirstElementByClassName('rose-dialog'),
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
