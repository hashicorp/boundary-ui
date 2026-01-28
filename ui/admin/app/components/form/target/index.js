/**
 * Copyright IBM Corp. 2024, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Component from '@glimmer/component';
import { assert } from '@ember/debug';
import rdpTargetForm from './rdp';
import sshTargetForm from './ssh';
import tcpTargetForm from './tcp';

const modelTypeToComponent = {
  rdp: rdpTargetForm,
  ssh: sshTargetForm,
  tcp: tcpTargetForm,
};

export default class FormTargetIndex extends Component {
  get targetFormComponent() {
    const component = modelTypeToComponent[this.args.model.type];
    assert(
      `Mapped component must exist for target type: ${this.args.model.type}`,
      component,
    );
    return component;
  }
}
