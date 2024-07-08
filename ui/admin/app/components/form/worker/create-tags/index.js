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
    // this is added to prevent the user from accidentally navigating away
    // from the page when they have unsaved changes
    this.addExitHandler();
  }

  // adds an exit handler to prevent the user from accidentally navigating away
  addExitHandler() {
    this.router.on('routeWillChange', this, this.confirmTransition);
  }

  // removes the exit handler
  removeExitHandler() {
    if (!this.hasRemovedExitHandler) {
      this.router.off('routeWillChange', this, this.confirmTransition);
      this.hasRemovedExitHandler = true;
    }
  }

  // checks if the transition is aborted and if there are any tags
  confirmTransition(transition) {
    if (transition.isAborted) return;

    if (this.apiTags.length) {
      this.confirmExit(transition);
    }
  }

  // displays a confirmation dialog to the user
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

  // removes the exit handler when the component is destroyed
  willDestroy() {
    super.willDestroy(...arguments);
    this.removeExitHandler();
  }

  // =actions

  /**
   * Creates a new Tag object and adds it to the `apiTags` array.
   * @param {object} option
   */
  @action
  addApiTag(option) {
    this.apiTags.pushObject(new Tag(option.key, option.value));
  }

  /**
   * Removes a Tag object from the `apiTags` array by index.
   * @param {number} index
   */
  @action
  removeApiTagByIndex(index) {
    this.apiTags.removeAt(index);
  }

  /**
   * Builds the `apiTags` object and submits it to the parent component.
   * If there are no tags, it transitions to the tags route.
   * @returns {void}
   */
  @action
  save() {
    this.removeExitHandler();

    if (this.apiTags.isEmpty) {
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
