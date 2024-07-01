/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { A } from '@ember/array';

class Tag {
  @tracked key;
  @tracked value;

  constructor(key, value) {
    this.key = key;
    this.value = value;
  }
}

export default class FormWorkerCreateTagsIndexComponent extends Component {
  // =services

  @service router;
  @service confirm;
  @service intl;

  // =attributes

  @tracked apiTags = A([]);
  hasRemovedExitHandler = false;

  constructor() {
    super(...arguments);
    this.addExitHandler();
  }

  addExitHandler() {
    this.router.on('routeWillChange', this, this.confirmTransition);
  }

  removeExitHandler() {
    if (!this.hasRemovedExitHandler) {
      this.router.off('routeWillChange', this, this.confirmTransition);
      this.hasRemovedExitHandler = true;
    }
  }

  confirmTransition(transition) {
    if (transition.isAborted) return;

    if (this.apiTags.length) {
      this.confirmExit(transition);
    }
  }

  async confirmExit(transition) {
    transition.abort();
    try {
      await this.confirm.confirm(this.intl.t('questions.abandon-confirm'), {
        title: 'titles.abandon-confirm',
        confirm: 'actions.discard',
      });
      this.apiTags = A([]);
      transition.retry();
    } catch (e) {
      // if user denies, do nothing
    }
  }

  willDestroy() {
    super.willDestroy(...arguments);
    this.removeExitHandler();
  }

  // =actions

  @action
  addApiTag(e) {
    this.apiTags.pushObject(new Tag(e.key, e.value));
  }

  @action
  removeApiTagByIndex(index) {
    this.apiTags.removeAt(index);
  }

  @action
  save() {
    this.removeExitHandler();

    if (!this.apiTags.isEmpty) {
      this.router.transitionTo('scopes.scope.workers.worker.tags');
      return;
    }

    const existingApiTags = this.args.model.api_tags || {};
    this.apiTags.forEach((tag) => {
      let key = tag.key;
      let values = tag.value.split(',');

      if (!existingApiTags[key]) {
        existingApiTags[key] = values;
      } else {
        existingApiTags[key] = Array.from(
          new Set([...existingApiTags[key], ...values]),
        );
      }
    });

    this.args.submit(existingApiTags);
  }
}
