import config from '../config/environment';

export default function() {

  this.passthrough('/write-coverage');
  // It's important that the passthrough for coverage is before the namespace, otherwise it will be prefixed.
  this.namespace = config.api.namespace;
}
