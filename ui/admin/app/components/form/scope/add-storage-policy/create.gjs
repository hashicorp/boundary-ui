import pageTitle from "ember-page-title/helpers/page-title";
import t from "ember-intl/helpers/t";
import Item from "admin/components/breadcrumbs/item/index";
import Page from "rose/components/rose/layout/page";
import PageHeader from "@hashicorp/design-system-components/components/hds/page-header/index";
import Container from "admin/components/breadcrumbs/container/index";
import Policy from "admin/components/form/policy/index";
import { fn } from "@ember/helper";
<template>{{!--
  Copyright IBM Corp. 2021, 2026
  SPDX-License-Identifier: BUSL-1.1
--}}

{{pageTitle (t "titles.new")}}
<Item @text={{t "resources.policy.titles.new"}} @route="scopes.scope.add-storage-policy.create" />

<Page as |page|>
  <page.header>
    <PageHeader as |PH|>
      <PH.Breadcrumb>
        <Container />
      </PH.Breadcrumb>
      <PH.Title>
        {{t "resources.policy.titles.new"}}
      </PH.Title>
    </PageHeader>
  </page.header>

  <page.body>
    <Policy @model={{@model}} @submit={{fn this.save @model}} @cancel={{fn this.cancel @model}} />
  </page.body>
</Page></template>