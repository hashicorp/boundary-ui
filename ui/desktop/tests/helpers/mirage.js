/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import startMirage from 'desktop/mirage/config';
import { createSetupMirage } from 'api/test-support/helpers/create-mirage-helper';
export const setupMirage = createSetupMirage(startMirage);
