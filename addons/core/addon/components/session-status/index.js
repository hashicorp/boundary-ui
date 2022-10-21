import Component from '@glimmer/component';

const STATUS_MAPPING = {
  //map session status to hds text color and icon style
  //more info - https://design-system-components-hashicorp.vercel.app/components/badge
  active: ['success', 'check'],
  pending: ['neutral', 'delay'],
  canceling: ['critical', 'x'],
  terminated: ['critical', 'x'],
};

export default class Status extends Component {
  get status() {
    return STATUS_MAPPING[this.args.status][0];
  }

  get icon() {
    return STATUS_MAPPING[this.args.status][1];
  }
}
