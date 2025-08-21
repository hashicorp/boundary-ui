/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Component from '@glimmer/component';
import { TYPES_TARGET } from 'api/models/target';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

// NOTE: this is all a temporary solution till we have a resource type helper.
const types = [...TYPES_TARGET].reverse();
const icons = {
  ssh: 'terminal-screen',
  tcp: 'network',
};
export default class FormTargetComponent extends Component {
  // =services

  @service features;

  @tracked currentStep = 0;

  get currentStep() {
    return this.currentStep || 0;
  }

  @tracked steps = [
      {
        name: 'Step 1',
        attributes: ['name', 'description', 'type'],
      },
      {
        name: 'Step 2',
        attributes: ['address', 'default_port'],
      },
      {
        name: 'Step 3',
        attributes: ['default_client_port', 'session_max_seconds', 'session_connection_limit'],
      },
    ];

  get errorFields() {
    console.log('errorFields CALLED')
    console.log('model: ', this.args.model);
    return this.args.model.errors.map(error => error.attribute);
  }

  get stepObjects() {
    console.log('stepObjects CALLED')
    const errorFields = this.errorFields;
    return this.steps.map((step) => ({
      ...step,
      hasError: step.attributes.some((attr) => errorFields.includes(attr)),
    }));
  }

  @action
  onStepChange(event, step) {
    this.currentStep = step;
  }

  @action
  onNextClickDemo() {
    this.currentStep = this.currentStep + 1;
  }

  @action
  onPrevClickDemo() {
    this.currentStep = this.currentStep - 1;
  }

  /**
   * maps resource type with icon
   * @type {object}
   */
  get typeMetas() {
    return types.map((type) => ({
      type,
      icon: icons[type],
    }));
  }

  /**
   * returns icons based on the model type
   * unlike other resources, this is needed as we use generic details component for both tcp and ssh
   * @type {string}
   */
  get icon() {
    return icons[this.args.model.type];
  }
}
