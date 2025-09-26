import { assert } from '@ember/debug';
import { getOwner } from '@ember/application';

export default function loading(_target, _propertyKey, desc) {
  let orig = desc.value;
  assert(
    'The @loading decorator must be applied to methods',
    typeof orig === 'function',
  );

  desc.value = function () {
    let owner = getOwner(this);
    assert('The target of the @loading decorator must have an owner.', !!owner);

    let service = owner.lookup('service:loading');
    return service.run(this, orig, ...arguments);
  };
}
