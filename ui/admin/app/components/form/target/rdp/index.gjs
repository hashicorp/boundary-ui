import Details from "admin/components/form/target/details/index";
<template>{{!--
  Copyright IBM Corp. 2021, 2026
  SPDX-License-Identifier: BUSL-1.1
--}}

<Details @model={{@model}} @defaultPort="3389" @submit={{@submit}} @cancel={{@cancel}} @changeType={{@changeType}} @globalScope={{@globalScope}} /></template>