import BaseModel from 'api/models/base';
import ScopeModel from 'api/models/scope';

/**
 * Overrides the `displayName` property of models to include a fallback
 * to i18n'd "Unnamed {{type}}".  This is done in the Core addon because
 * the API addon does not include i18n concerns.
 */
export function initialize(owner) {
  const intl = owner.lookup('service:intl');

  /**
   * When a resource has an empty `name`, default to `"Unnamed {{modelName}}"`
   * for display purposes.
   */
  Object.defineProperty(BaseModel.prototype, 'displayName', {
    get() {
      const { modelName } = this.constructor;
      const resourceTypeName = intl.t(`resources.${modelName}.title`);
      return this.name || `Unnamed ${resourceTypeName}`;
    },
  });

  /**
   * When a scope has an empty `name`, default to `"Unnamed {{scopeType}}"`
   * for display purposes.
   */
  Object.defineProperty(ScopeModel.prototype, 'displayName', {
    get() {
      const { type } = this;
      const scopeTypeName = intl.t(`resources.${type}.title`);
      return this.name || `Unnamed ${scopeTypeName}`;
    },
  });
}

export default { initialize };
