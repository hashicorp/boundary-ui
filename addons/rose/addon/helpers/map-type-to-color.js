/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

export default function mapTypeToColor(flashMsgType) {
  // Maps the flash message type parameter to the correct hds color.
  switch (flashMsgType) {
    case 'error':
      return 'critical';
    case 'success':
      return 'success';
    case 'warning':
      return 'warning';
    default:
      return 'neutral';
  }
}
