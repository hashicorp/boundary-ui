import IconTile from '@hashicorp/design-system-components/components/hds/icon-tile/index';
import Body from '@hashicorp/design-system-components/components/hds/text/body';
import Icon from '@hashicorp/design-system-components/components/hds/icon/index';
<template>
  {{!
  Copyright IBM Corp. 2021, 2026
  SPDX-License-Identifier: BUSL-1.1
}}

  <li class='ordered-series-diagram-item'>

    <div class='ordered-series-diagram-item-content'>
      <IconTile @icon={{@icon}} @size='large' @color='hcp' />
      <Body
        @weight='semibold'
        @size='300'
        class='ordered-series-diagram-item-title'
      >
        {{yield}}
      </Body>
    </div>

    <div class='ordered-series-diagram-separator-icon'>
      {{!
      Separator icon is not configurable, but potentially could be.
    }}
      <Icon @name='arrow-right' @size='24' @isInline={{true}} />
    </div>

  </li>
</template>
