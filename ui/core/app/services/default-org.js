import Service from '@ember/service';
import { getOwner } from '@ember/application';

/**
 * The name of the default org ID meta tag.
 * @type {string}
 */
export const metaTagName = 'default-org-id';

/**
 * This is the literal value of an uninterpolated meta tag.  In development,
 * the meta tag is always uninterpolated.  It isn't yet known to occur in
 * production, but could occur if there were no org ID, or if interpolation
 * failed for some reason.
 * @type {string}
 */
export const metaTagEmtpyValue = '{{DEFAULT_ORG_ID}}';

/**
 *
 */
export function findDefaultOrgMetaTag (document) {
  const metaTags = document.getElementsByTagName('meta');
  const defaultOrgMetaTag = [...metaTags]
    .find(element => element.name === metaTagName);
  return defaultOrgMetaTag;
}

/**
 * A dead-simple service that exposes the default org ID that is interpolated
 * into the `index.html` header by our backend.
 */
export default class DefaultOrgService extends Service {

  /**
   * The interpolated value of the default org meta tag.  If the tag does not
   * exist or the value is uninterpolated, returns null.
   * @type {string|null}
   */
  get defaultOrgID() {
    const document = getOwner(this).lookup('service:-document').documentElement;
    const tag = findDefaultOrgMetaTag(document);
    if (tag && tag.getAttribute('value') !== metaTagEmtpyValue) {
      return tag.getAttribute('value');
    }
    return null;
  }

}
