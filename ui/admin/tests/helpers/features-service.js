import { getContext } from '@ember/test-helpers';

export function enableFeature(flag) {
  const { owner } = getContext();
  const featuresService = owner.lookup('service:features');
  featuresService.enable(flag);
}

export function disableFeature(flag) {
  const { owner } = getContext();
  const featuresService = owner.lookup('service:features');
  featuresService.disable(flag);
}
