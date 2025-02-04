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
    for (const domain in ApiClasses) {
      const DomainApiClass = ApiClasses[domain];
      const api = new DomainApiClass();
      apis[domain] = api;
    }

    await use(apis as ApiTestFixture['boundaryApi']);
  },
});
