import { module/*, test */} from 'qunit';
import { setupTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Unit | Authenticator | OIDC', function (hooks) {
  setupTest(hooks);
  setupMirage(hooks);
});
