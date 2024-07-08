/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import Tag from '../tag';

export default class FormWorkerCreateTagsIndexComponent extends Component {
  // =services

  @service router;
  @service confirm;
  @service intl;

  // =attributes

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

    if (this.args.apiTags.length) {
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
      this.args.apiTags = this.args.apiTags.splice(0, this.args.apiTags.length);
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
    this.args.apiTags.push(new Tag(option.key, option.value));
  }

  /**
   * Removes a Tag object from the `apiTags` array by index.
   * @param {number} index
   */
  @action
  removeApiTagByIndex(index) {
    this.args.apiTags.splice(index, 1);
  }

  /**
   * Uses `apiTags` to build and submits it to the parent component.
   * If there are no tags, it transitions to the tags route.
   * @returns {void}
   */
  @action
  save() {
    this.removeExitHandler();

    if (this.args.apiTags.length === 0) {
      this.router.transitionTo('scopes.scope.workers.worker.tags');
      return;
    }

    const existingApiTags = this.args.model.api_tags ?? {};
    this.args.apiTags.forEach((tag) => {
      let key = tag.key;
      let values = tag.value.split(',');

      if (!existingApiTags[key]) {
        existingApiTags[key] = values;
      } else {
        existingApiTags[key] = [
          ...new Set([...existingApiTags[key], ...values]),
        ];
      }
    });

    this.args.submit(existingApiTags);
  }
}
