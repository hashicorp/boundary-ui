import Badge from '@hashicorp/design-system-components/components/hds/badge/index';
<template>
  <Badge
    @icon={{if @scope.isProject 'grid' (if @scope.isOrg 'org' 'globe')}}
    @text={{@scope.displayName}}
  />
</template>
