/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

export default function mapTypeToColor(flashMsgType) {
  // Maps the flash message type parameter to the correct hds color.
  let color = 'neutral';
  switch (flashMsgType) {
    case 'error':
      color = 'critical';
      break;
    case 'success':
      color = 'success';
      break;
    case 'warning':
      color = 'warning';
      break;
  }
  return color;
}
