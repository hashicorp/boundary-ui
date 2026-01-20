/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import Component from '@glimmer/component';

const STATUS_MAPPING = {
  //map session status to hds text color and icon style
  //more info - https://design-system-components-hashicorp.vercel.app/components/badge
  active: { color: 'success', icon: 'check', type: 'filled', text: 'Active' },
  pending: { color: 'neutral', icon: 'delay', type: 'filled', text: 'Pending' },
  canceling: {
    color: 'warning',
    icon: 'alert-triangle',
    type: 'filled',
    text: 'Canceling',
  },
  terminated: {
    color: 'critical',
    icon: 'x',
    type: 'filled',
    text: 'Terminated',
  },
};

export default class SessionStatus extends Component {
  //any status that do not belong in the mapping above, will have a neutral style with outlined badge
  get statusBadgeColor() {
    return STATUS_MAPPING[this.args.model.status]?.color || 'neutral';
  }

  get statusBadgeIcon() {
    return STATUS_MAPPING[this.args.model.status]?.icon;
  }

  get statusBadgeType() {
    return STATUS_MAPPING[this.args.model.status]?.type || 'outlined';
  }

  get statusBadgeText() {
    return STATUS_MAPPING[this.args.model.status]?.text;
  }
}
