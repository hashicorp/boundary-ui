/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

export const FIELD_DESTINATION_ID = '[name=destination_id]';
export const FIELD_HOST_ID = '[name=authorize_session_arguments]';

export const TABLE_ROW_ID_ACTION_DROPDOWN = (id) =>
  `tbody [data-test-alias-row="${id}"] td:last-child button`;
export const TABLE_ROW_ID_ACTION_DROPDOWN_ITEM_LINK = (id) =>
  `tbody [data-test-alias-row="${id}"] td:last-child ul li a`;
