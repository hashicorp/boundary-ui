/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Component from '@glimmer/component';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { modifier } from 'ember-modifier';

/*
  `BreadcrumbsItem` inserts the crumbs to an existing container.
  For our purposes, there will always be at most one container.
*/

export default class BreadcrumbsItemComponent extends Component {
  @service('breadcrumbs') breadcrumbsService;

  @tracked element = null;

  insertedBreadcrumbItem = modifier((element) => {
    this.element = element;
  });

  get current() {
    const crumbs = this.breadcrumbsService.containers[0].element.children;
    const lastCrumb = crumbs[crumbs.length - 1];
    return lastCrumb.isEqualNode(this.element);
  }
}

{{!
  Copyright IBM Corp. 2021, 2026
  SPDX-License-Identifier: BUSL-1.1
}}

{{#each this.breadcrumbsService.containers as |container|}}
  {{#in-element container.element insertBefore=null}}
    <Hds::Breadcrumb::Item
      @text={{@text}}
      @icon={{@icon}}
      @route={{@route}}
      @models={{@models}}
      @query={{@query}}
      @model={{@model}}
      @current={{this.current}}
      ...attributes
      {{this.insertedBreadcrumbItem}}
      data-test-breadcrumbs-item
    />
  {{/in-element}}
{{/each}}