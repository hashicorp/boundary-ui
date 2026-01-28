/**
 * Copyright IBM Corp. 2024, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Component from '@glimmer/component';
import { service } from '@ember/service';
import { action } from '@ember/object';
import Tag from '../tag';

export default class FormWorkerCreateTagsIndexComponent extends Component {
  // =services

  @service router;

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
   * Uses `@apiTags` to build and submits it to the parent component.
   * If there are no tags, it transitions to the tags route.
   * @returns {void}
   */
  @action
  save() {
    if (this.args.apiTags.length === 0) {
      this.router.transitionTo('scopes.scope.workers.worker.tags');
      return;
    }

    const apiTags = structuredClone(this.args.model.api_tags ?? {});
    this.args.apiTags.forEach((tag) => {
      let key = tag.key;
      let values = tag.value.split(',').map((value) => value.trim());

      if (!apiTags[key]) {
        apiTags[key] = values;
      } else {
        apiTags[key] = [...new Set([...apiTags[key], ...values])];
      }
    });

    this.args.submit(apiTags);
  }
}
