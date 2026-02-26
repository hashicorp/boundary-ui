import Container from '@hashicorp/design-system-components/components/hds/card/container';
import { hash } from '@ember/helper';
import LinkListPanelItem from 'admin/components/link-list-panel/item/index';
<template>
  <Container @level='mid' @hasBorder={{true}}>
    <ul>
      {{yield
        (hash
          Item=(component
            LinkListPanelItem
            icon=@icon
            color=@color
            text=@text
            route=@route
            model=@model
          )
        )
      }}
    </ul>
  </Container>
</template>
