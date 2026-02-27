import { hash } from "@ember/helper";
import OrderedSeriesDiagramItem from "admin/components/ordered-series-diagram/item/index";
import OrderedSeriesDiagramGroup from "admin/components/ordered-series-diagram/group/index";
<template>{{!--
  Copyright IBM Corp. 2021, 2026
  SPDX-License-Identifier: BUSL-1.1
--}}

<ol class="ordered-series-diagram" ...attributes>
  {{yield (hash Item=(component OrderedSeriesDiagramItem) Group=(component OrderedSeriesDiagramGroup))}}
</ol></template>