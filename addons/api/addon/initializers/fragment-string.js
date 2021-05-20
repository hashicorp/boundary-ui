// app/initializers/fragment-serializer.js
import FragmentStringSerializer from '../serializers/fragment-string';

export function initialize(application) {
  application.register('serializer:fragment-string', FragmentStringSerializer);
}

// Fragment serializers must be manually registered
export default {
  name: 'fragment-string',
  initialize: initialize,
};
