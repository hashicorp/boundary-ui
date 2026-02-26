/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import isArray from 'ember-truth-helpers/helpers/is-array';
import { LinkTo } from '@ember/routing';
import IconTile from '@hashicorp/design-system-components/components/hds/icon-tile/index';
import Body from '@hashicorp/design-system-components/components/hds/text/body';
import Icon from '@hashicorp/design-system-components/components/hds/icon/index';
<template>
  <li class='link-list-item'>
    {{#if @route}}
      {{#if (isArray @model)}}
        <LinkTo @route={{@route}} @models={{@model}}>
          <div class='link-list-item__info'>
            {{#if @icon}}
              <IconTile @color={{@color}} @icon={{@icon}} @size='small' />
            {{/if}}

            <div>
              <Body @tag='p' @size='300' class='link-list-item__text'>
                {{@text}}
              </Body>
              {{yield}}
            </div>
          </div>

          <Icon @name='arrow-right' @isInline={{true}} />
        </LinkTo>
      {{else}}
        <LinkTo @route={{@route}} @model={{@model}}>
          <div class='link-list-item__info'>
            {{#if @icon}}
              <IconTile @color={{@color}} @icon={{@icon}} @size='small' />
            {{/if}}

            <div>
              <Body @tag='p' @size='300' class='link-list-item__text'>
                {{@text}}
              </Body>
              {{yield}}
            </div>
          </div>

          <Icon @name='arrow-right' @isInline={{true}} />
        </LinkTo>
      {{/if}}
    {{else}}
      <div class='link-list-item__info'>
        {{#if @icon}}
          <IconTile @color={{@color}} @icon={{@icon}} @size='small' />
        {{/if}}

        <div>
          <Body @tag='p' @size='300' class='link-list-item__text'>
            {{@text}}
          </Body>
          {{yield}}
        </div>
      </div>
    {{/if}}
  </li>
</template>
