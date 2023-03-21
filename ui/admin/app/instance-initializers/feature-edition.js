export function initialize(owner) {
  const service = owner.lookup('service:feature-edition');
  service.initialize();
}

export default {
  initialize,
};
