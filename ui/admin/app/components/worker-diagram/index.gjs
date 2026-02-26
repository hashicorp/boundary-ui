import featureFlag from 'ember-feature-flags/helpers/feature-flag';
import Hcp from 'admin/components/worker-diagram/dual-filter/hcp/index';
import DualFilter from 'admin/components/worker-diagram/dual-filter/index';
import SingleFilter from 'admin/components/worker-diagram/single-filter/index';
<template>
  <div class='worker-diagram'>
    {{#if (featureFlag 'worker-filter')}}
      {{#if (featureFlag 'worker-filter-hcp')}}
        <Hcp
          @egressWorkerFilterEnabled={{@egressWorkerFilterEnabled}}
          @ingressWorkerFilterEnabled={{@ingressWorkerFilterEnabled}}
        />
      {{else}}
        <DualFilter
          @egressWorkerFilterEnabled={{@egressWorkerFilterEnabled}}
          @ingressWorkerFilterEnabled={{@ingressWorkerFilterEnabled}}
        />
      {{/if}}
    {{else}}
      <SingleFilter @egressWorkerFilterEnabled={{@egressWorkerFilterEnabled}} />
    {{/if}}
  </div>
</template>
