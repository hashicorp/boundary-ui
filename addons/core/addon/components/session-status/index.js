import Component from '@glimmer/component';

const STATUS_MAPPING = {
  //map session status to hds text color and icon style
  //more info - https://design-system-components-hashicorp.vercel.app/components/badge
  active: { color: 'success', icon: 'check', type: 'filled' },
  pending: { color: 'neutral', icon: 'delay', type: 'filled' },
  canceling: { color: 'warning', icon: 'alert-triangle', type: 'filled' },
  terminated: { color: 'critical', icon: 'x', type: 'filled' },
};

export default class SessionStatus extends Component {
  //any status that do not belong in the mapping above, will have a neutral style with outlined badge
  get statusBadgeColor() {
    return STATUS_MAPPING[this.args.status]
      ? STATUS_MAPPING[this.args.status]['color']
      : 'neutral';
  }

  get statusBadgeIcon() {
    return (
      STATUS_MAPPING[this.args.status] &&
      STATUS_MAPPING[this.args.status]['icon']
    );
  }

  get statusBadgeType() {
    return STATUS_MAPPING[this.args.status]
      ? STATUS_MAPPING[this.args.status]['type']
      : 'outlined';
  }
}
