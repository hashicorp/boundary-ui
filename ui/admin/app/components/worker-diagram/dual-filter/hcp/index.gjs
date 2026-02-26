/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import and from 'ember-truth-helpers/helpers/and';
import OrderedSeriesDiagram from 'admin/components/ordered-series-diagram/index';
import t from 'ember-intl/helpers/t';
import Body from '@hashicorp/design-system-components/components/hds/text/body';
import featureFlag from 'ember-feature-flags/helpers/feature-flag';
<template>
  {{#if (and @egressWorkerFilterEnabled @ingressWorkerFilterEnabled)}}
    <OrderedSeriesDiagram data-test-dual-filter-hcp-egress-on-ingress-on as |D|>
      <D.Item @icon='user'>
        {{t 'resources.target.workers.diagram.client'}}
      </D.Item>
      <D.Item @icon='settings'>
        {{t 'resources.target.workers.diagram.ingress-worker'}}
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
      {{t
        'resources.target.workers.filter-explainer.dual-egress-on-ingress-on'
      }}
    </Body>
  {{else if @ingressWorkerFilterEnabled}}
    <OrderedSeriesDiagram
      data-test-dual-filter-hcp-egress-off-ingress-on
      as |D|
    >
      <D.Item @icon='user'>
        {{t 'resources.target.workers.diagram.client'}}
      </D.Item>
      <D.Item @icon='settings'>
        {{t 'resources.target.workers.diagram.ingress-worker'}}
      </D.Item>
      <D.Item @icon='server'>
        {{t 'resources.target.workers.diagram.host'}}
      </D.Item>
    </OrderedSeriesDiagram>
    <Body @tag='p' @size='100' @color='faint'>
      {{t 'resources.target.workers.filter-explainer.ingress-worker'}}
    </Body>
  {{else if @egressWorkerFilterEnabled}}
    <OrderedSeriesDiagram
      data-test-dual-filter-hcp-egress-on-ingress-off
      as |D|
    >
      <D.Item @icon='user'>
        {{t 'resources.target.workers.diagram.client'}}
      </D.Item>
      <D.Item @icon='settings'>
        {{#if (featureFlag 'worker-filter-hcp')}}
          {{t 'resources.target.workers.diagram.hcp-worker'}}
        {{else}}
          {{t 'resources.target.workers.diagram.frontline-worker'}}
        {{/if}}
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
      {{t 'resources.target.workers.filter-explainer.hcp-dual-egress-on'}}
    </Body>
  {{else}}
    <OrderedSeriesDiagram
      data-test-dual-filter-hcp-egress-off-ingress-off
      as |D|
    >
      <D.Item @icon='user'>
        {{t 'resources.target.workers.diagram.client'}}
      </D.Item>
      <D.Item @icon='settings'>
        {{t 'resources.target.workers.diagram.hcp-worker'}}
      </D.Item>
      <D.Item @icon='server'>
        {{t 'resources.target.workers.diagram.host'}}
      </D.Item>
    </OrderedSeriesDiagram>
    <Body @tag='p' @size='100' @color='faint'>
      {{t 'resources.target.workers.filter-explainer.hcp-worker'}}
    </Body>
  {{/if}}
</template>
