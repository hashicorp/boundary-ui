/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Helper from '@ember/component/helper';

/**
 * Returns the CSP style-src nonce from the document's head metadata.
 */
export default class CspNonceHelper extends Helper {
  compute() {
    return (
      document
        ?.querySelector('meta[name="csp-nonce"]')
        ?.getAttribute('content')
        ?.trim() ?? ''
    );
  }
}
