// app/initializers/fragment-serializer.js
import FragmentAuthMethodAttributesAccountClaimMapSerializer from '../serializers/fragment-auth-method-attributes-account-claim-map';

export function initialize(application) {
  application.register(
    'serializer:fragment-auth-method-attributes-account-claim-map',
    FragmentAuthMethodAttributesAccountClaimMapSerializer
  );
}

// Fragment serializers must be manually registered
export default {
  name: 'fragment-auth-method-attributes-account-claim-map',
  initialize: initialize,
};
