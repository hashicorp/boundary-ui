import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';

module(
  'Unit | Route | scopes/scope/authenticate/method/oidc',
  function (hooks) {
    setupTest(hooks);

    let route, flashMessagesService, intlService;
    let originalQueue;

    function createFlashMessage(message, type = 'danger') {
      return {
        message,
        type,
        // Add destroyMessage method to the flash message object
        // This is needed because we're using a simplified mock queue in tests rather than
        // the actual flash messages implementation. In production, flash messages would have
        // this method natively, but we need to add it manually for testing purposes.
        destroyMessage() {
          const index = flashMessagesService.queue.indexOf(this);
          if (index !== -1) {
            flashMessagesService.queue.splice(index, 1);
          }
        },
      };
    }

    hooks.beforeEach(function () {
      route = this.owner.lookup('route:scopes/scope/authenticate/method/oidc');
      flashMessagesService = this.owner.lookup('service:flashMessages');
      intlService = this.owner.lookup('service:intl');

      sinon
        .stub(intlService, 't')
        .withArgs('errors.authentication-failed.title')
        .returns('Authentication Failed');

      // Need to stub the exists method to avoid "Cannot read properties of undefined (reading 'some')" error
      sinon.stub(intlService, 'exists').returns(true);

      // Store original queue and create a mock queue
      originalQueue = flashMessagesService.queue;
      flashMessagesService.queue = [];
      flashMessagesService.queue.clear = function () {
        this.length = 0;
      };

      sinon
        .stub(flashMessagesService, 'danger')
        .callsFake(function (message, opts) {
          const flashMessage = createFlashMessage(message);
          this.queue.push({ ...flashMessage, ...opts });
        });

      // Stub refresh method that is called by the poller task
      // Without this stub, the route.activate() call would trigger the poller which attempts
      // to call refresh(), causing "Cannot read properties of undefined" errors since the
      // actual refresh implementation relies on router and model hooks not available in unit tests
      route.refresh = () => {};
    });

    hooks.afterEach(function () {
      flashMessagesService.queue = originalQueue;
      sinon.restore();
    });

    test('it shows and clears flash message on error and activate', async function (assert) {
      assert.expect(4);

      const error = new Error('Authentication Failed');
      const expectedErrorMessage = 'Authentication Failed';

      route.router = { transitionTo: sinon.stub() };

      await route.error(error);

      assert.ok(
        route.router.transitionTo.calledWith(
          'scopes.scope.authenticate.method.index',
        ),
        'Router transition was triggered',
      );

      assert.strictEqual(
        flashMessagesService.queue.length,
        1,
        'Flash message was added by notifyError',
      );

      assert.strictEqual(
        flashMessagesService.queue[0].message,
        expectedErrorMessage,
        'Correct error message is displayed',
      );

      route.activate();

      assert.strictEqual(
        flashMessagesService.queue.length,
        0,
        'Flash message was cleared by activate hook',
      );
    });

    test('it does not clear non-authentication-error flash messages during activate', function (assert) {
      assert.expect(2);

      const otherErrorMessage = 'Some other error';
      flashMessagesService.queue.push(createFlashMessage(otherErrorMessage));

      assert.strictEqual(
        flashMessagesService.queue.length,
        1,
        'Flash message was added',
      );

      route.activate();

      assert.strictEqual(
        flashMessagesService.queue.length,
        1,
        'Non-authentication flash messages are preserved after activate hook',
      );
    });
  },
);
