import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class MappingListComponent extends Component {
  @tracked
  newOptionKey;
  @tracked
  newOptionValue;

  @action
  addOption() {
    if (this.args.addOption) {
      this.args.addOption({
        key: this.newOptionKey,
        value: this.newOptionValue,
      });
    }

    this.newOptionKey = '';
    this.newOptionValue = '';
  }

  @action
  removeOptionByIndex(index) {
    if (this.args.removeOptionByIndex) {
      this.args.removeOptionByIndex(index);
    }
  }
}
