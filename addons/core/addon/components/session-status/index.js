import Component from '@glimmer/component';

const STATUS_MAPPING = {
  //map session status to hds text color and icon style
  //more info - https://design-system-components-hashicorp.vercel.app/components/badge
  active: { color: 'success', icon: 'check' },
  pending: { color: 'neutral', icon: 'delay' },
  canceling: { color: 'critical', icon: 'x' },
  terminated: { color: 'critical', icon: 'x' },
};

export default class SessionStatus extends Component {
  get statusColor() {
    return STATUS_MAPPING[this.args.status]['color'];
  }

  get statusIcon() {
    return STATUS_MAPPING[this.args.status]['icon'];
  }
}
