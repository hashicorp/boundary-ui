/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { test as base } from '@playwright/test';
import { Configuration, TargetServiceApi } from '../../api-client';

type ApiTestFixture = {
  boundaryApi: {
    target: TargetServiceApi;
  };
};

const ApiClasses = {
  target: TargetServiceApi,
} as const;

export const apiTest = base.extend<ApiTestFixture>({
  boundaryApi: async ({}, use) => {
    const apis = {};

    const openapiConfiguration = new Configuration({ basePath: process.env.BOUNDARY_ADDR ?? 'http://localhost:9200', headers: { Authorization: `Bearer ${process.env.E2E_TOKEN}` }})

    for (const domain in ApiClasses) {
      const DomainApiClass = ApiClasses[domain];
      const api = new DomainApiClass(openapiConfiguration);
      apis[domain] = api;
    }

    await use(apis as ApiTestFixture['boundaryApi']);
  },
});
