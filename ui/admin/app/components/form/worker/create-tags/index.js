/**
 * Copyright IBM Corp. 2021, 2026
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
  addApiTag() {
    this.args.apiTags.push(new Tag());
  }

  /**
   * Removes a Tag object from the `apiTags` array by index.
   * @param {number} index
   */
  @action
  removeApiTagByIndex(rowData) {
    const index = this.args.apiTags.indexOf(rowData);
    if (index !== -1) {
      this.args.apiTags.splice(index, 1);
    }
    if (this.args.apiTags.length === 0) {
      this.args.apiTags.push(new Tag());
    }
  }

  @action
  updateApiTagValue(rowData, property, event) {
    rowData[property] = event.target.value;
  }
  /**
   * Uses `@apiTags` to build and submits it to the parent component.
   * If there are no tags, it transitions to the tags route.
   * @returns {void}
   */
  @action
  save() {
    const tagsToProcess = this.args.apiTags.filter((tag) => tag.key?.trim());
    if (tagsToProcess.length === 0) {
      this.router.transitionTo('scopes.scope.workers.worker.tags');
      return;
    }

    const apiTags = structuredClone(this.args.model.api_tags ?? {});
    tagsToProcess.forEach((tag) => {
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
