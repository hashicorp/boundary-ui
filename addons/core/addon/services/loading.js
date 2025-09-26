import Service, { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { restartableTask, task, timeout } from 'ember-concurrency';
import { getOwner } from '@ember/application';
import { defer } from 'rsvp';

/**
 * @param  {...any} args
 * @returns {[Object|null, Function, Array<any>|undefined]}
 */
function parseArgs(...args) {
  let length = arguments.length;

  let method;
  let target;

  if (length === 1) {
    target = null;
    method = arguments[0];
  } else if (length > 1) {
    let argsIndex = 2;
    let methodOrTarget = arguments[0];
    let methodOrArgs = arguments[1];
    let type = typeof methodOrArgs;
    if (type === 'function') {
      target = methodOrTarget;
      method = methodOrArgs;
    } else if (
      methodOrTarget !== null &&
      type === 'string' &&
      methodOrArgs in methodOrTarget
    ) {
      target = methodOrTarget;
      method = target[methodOrArgs];
    } else if (typeof methodOrTarget === 'function') {
      argsIndex = 1;
      target = null;
      method = methodOrTarget;
    }

    if (length > argsIndex) {
      let len = length - argsIndex;
      args = new Array(len);
      for (let i = 0; i < len; i++) {
        args[i] = arguments[i + argsIndex];
      }
    }
  }

  return [target, method, args];
}

export default class LoadingService extends Service {
  @service
  router;

  postDelay = 0;
  preDelay = 0;
  watchTransitions = true;

  get isLoading() {
    return this._runJob.isRunning;
  }

  get showLoading() {
    return (
      !this.preDelayTask.isRunning &&
      (this.isLoading || this.postDelayTask.isRunning)
    );
  }

  _routerTransitionDeferred;

  @action
  _routeWillChange() {
    let deferred = defer();
    if (this._routerTransitionDeferred) {
      this._routerTransitionDeferred.resolve();
    }
    this._routerTransitionDeferred = deferred;
    this.run(() => deferred.promise);
  }

  @action
  _routeDidChange() {
    if (this._routerTransitionDeferred) {
      this._routerTransitionDeferred.resolve();
      this._routerTransitionDeferred = undefined;
    }
  }

  // eslint-disable-next-line ember/classic-decorator-hooks
  init() {
    super.init();

    let config =
      getOwner(this).resolveRegistration('config:environment')['ember-loading'];
    if (config) {
      this.preDelay = config.preDelay || 0;
      this.postDelay = config.postDelay || 0;
      this.watchTransitions = config.watchTransitions !== false;
    }

    if (this.watchTransitions) {
      this.router.on('routeWillChange', this._routeWillChange);
      this.router.on('routeDidChange', this._routeDidChange);
    }
  }

  willDestroy() {
    super.willDestroy();

    if (this.watchTransitions) {
      this.router.off('routeWillChange', this._routeWillChange);
      this.router.off('routeDidChange', this._routeDidChange);
    }
  }

  async run(...args) {
    if (this.preDelay > 0) {
      this.preDelayTask.perform(this.preDelay);
    }

    let result = await this._runJob.perform(...args);

    if (this.postDelay > 0) {
      this.postDelayTask.perform(this.postDelay);
    }

    return result;
  }

  @task
  async _runJob(...args) {
    let [target, method, realArgs] = parseArgs(...args);
    return await method.apply(target, realArgs);
  }

  @restartableTask
  async preDelayTask(delay) {
    await timeout(delay);
  }

  @restartableTask
  async postDelayTask(delay) {
    await timeout(delay);
  }
}
