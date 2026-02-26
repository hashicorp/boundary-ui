import Details from 'admin/components/form/target/details/index';
<template>
  <Details
    @model={{@model}}
    @defaultPort='22'
    @submit={{@submit}}
    @cancel={{@cancel}}
    @changeType={{@changeType}}
    @globalScope={{@globalScope}}
  />
</template>
