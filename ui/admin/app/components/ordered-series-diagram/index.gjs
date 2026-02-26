import { hash } from '@ember/helper';
import OrderedSeriesDiagramItem from 'admin/components/ordered-series-diagram/item/index';
import OrderedSeriesDiagramGroup from 'admin/components/ordered-series-diagram/group/index';
<template>
  <ol class='ordered-series-diagram' ...attributes>
    {{yield
      (hash
        Item=(component OrderedSeriesDiagramItem)
        Group=(component OrderedSeriesDiagramGroup)
      )
    }}
  </ol>
</template>
