import Badge from '@hashicorp/design-system-components/components/hds/badge/index';
<template>
  {{!
  Copyright IBM Corp. 2021, 2026
  SPDX-License-Identifier: BUSL-1.1
}}

  <Badge
    @icon={{if @scope.isProject 'grid' (if @scope.isOrg 'org' 'globe')}}
    @text={{@scope.displayName}}
  />
</template>
