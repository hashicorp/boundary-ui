/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import OrderedSeriesDiagram from 'admin/components/ordered-series-diagram/index';
import t from 'ember-intl/helpers/t';
import Body from '@hashicorp/design-system-components/components/hds/text/body';
<template>
  {{#if @egressWorkerFilterEnabled}}
    <OrderedSeriesDiagram data-test-single-filter-egress-on as |D|>
      <D.Item @icon='user'>
        {{t 'resources.target.workers.diagram.client'}}
      </D.Item>
      <D.Group
        @title={{t 'resources.target.workers.diagram.network'}}
        @color='highlight'
      >
        <D.Item @icon='settings'>
          {{t 'resources.target.workers.diagram.egress-worker'}}
        </D.Item>
        <D.Item @icon='server'>
          {{t 'resources.target.workers.diagram.host'}}
        </D.Item>
      </D.Group>
    </OrderedSeriesDiagram>
    <Body @tag='p' @size='100' @color='faint'>
      {{t 'resources.target.workers.filter-explainer.egress-worker'}}
    </Body>
  {{else}}
    <OrderedSeriesDiagram data-test-single-filter-egress-off as |D|>
      <D.Item @icon='user'>
        {{t 'resources.target.workers.diagram.client'}}
      </D.Item>
      <D.Item @icon='settings'>
        {{t 'resources.target.workers.diagram.any-worker'}}
      </D.Item>
      <D.Item @icon='server'>
        {{t 'resources.target.workers.diagram.host'}}
      </D.Item>
    </OrderedSeriesDiagram>
    <Body @tag='p' @size='100' @color='faint'>
      {{t 'resources.target.workers.filter-explainer.any-worker'}}
    </Body>
  {{/if}}
</template>
