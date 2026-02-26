/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { hash } from '@ember/helper';
import can from 'admin/helpers/can';
import and from 'ember-truth-helpers/helpers/and';
import featureFlag from 'ember-feature-flags/helpers/feature-flag';
import or from 'ember-truth-helpers/helpers/or';
import Dropdown from '@hashicorp/design-system-components/components/hds/dropdown/index';
import t from 'ember-intl/helpers/t';
import { on } from '@ember/modifier';
<template>
  {{#let
    (hash
      canCreateCredLibraries=(can
        'create model' @model collection='credential-libraries'
      )
      canCreateCredentials=(can 'create model' @model collection='credentials')
      canDelete=(can 'delete model' @model)
      canEditWorkerFilter=(and (featureFlag 'worker-filter') @model.isVault)
    )
    as |perms|
  }}
    {{#if
      (or
        perms.canCreateCredLibraries
        perms.canCreateCredentials
        perms.canEditWorkerFilter
        perms.canDelete
      )
    }}
      <Dropdown data-test-manage-credential-stores-dropdown as |dd|>
        <dd.ToggleButton @text={{t 'actions.manage'}} @color='secondary' />
        {{#if perms.canCreateCredLibraries}}
          <dd.Interactive
            @route='scopes.scope.credential-stores.credential-store.credential-libraries.new'
          >
            {{t 'resources.credential-library.actions.create'}}
          </dd.Interactive>
        {{/if}}
        {{#if perms.canCreateCredentials}}
          <dd.Interactive
            @route='scopes.scope.credential-stores.credential-store.credentials.new'
          >
            {{t 'resources.credential.actions.create'}}
          </dd.Interactive>
        {{/if}}
        {{#if perms.canEditWorkerFilter}}
          <dd.Interactive
            @route='scopes.scope.credential-stores.credential-store.edit-worker-filter'
          >
            {{t 'actions.edit-worker-filter'}}
          </dd.Interactive>
        {{/if}}
        {{#if perms.canDelete}}
          {{#if
            (or
              perms.canCreateCredLibraries
              perms.canCreateCredentials
              perms.canEditWorkerFilter
            )
          }}
            <dd.Separator />
          {{/if}}
          <dd.Interactive @color='critical' {{on 'click' @delete}}>
            {{t 'resources.credential-store.actions.delete'}}
          </dd.Interactive>
        {{/if}}
      </Dropdown>
    {{/if}}
  {{/let}}
</template>
