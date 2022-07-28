import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { later } from '@ember/runloop';

export const COPY_ICON_TYPE = 'flight-icons/svg/clipboard-copy-16';
export const COPIED_ICON_TYPE = 'flight-icons/svg/clipboard-checked-16';

export default class RoseCodeEditorToolbarComponent extends Component {
  @tracked copyIconType = COPY_ICON_TYPE;

  @action
  copied() {
    let { onCopy } = this.args;
    let originalIconType = this.copyIconType;

    this.copyIconType = COPIED_ICON_TYPE;

    if (onCopy) {
      onCopy();
    }

    later(() => (this.copyIconType = originalIconType), 1000);
  }
}
