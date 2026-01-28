/**
 * Copyright IBM Corp. 2024, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

export const FIELD_ISSUER = '[name=issuer]';
export const FIELD_ISSUER_VALUE = 'Issuer fake value';
export const FIELD_CLIENT_ID = '[name=client_id]';
export const FIELD_CLIENT_ID_VALUE = 'Client id value';
export const FIELD_CLIENT_SECRET = '[name=client_secret]';
export const FIELD_CLIENT_SECRET_VALUE = 'Client secret value';
export const FIELD_SIGNING_ALGORITHMS = '[name=signing_algorithms] select';
export const FIELD_SIGNING_ALGORITHMS_VALUE = 'RS384';
export const FIELD_SIGNING_ALGORITHMS_ADD_BTN = '[data-test-add-option-button]';
export const FIELD_SIGNING_ALGORITHMS_DELETE_BTN =
  '[name=signing_algorithms] tbody td:last-child button[aria-label=Remove]';
export const FIELD_ALLOWED_AUDIENCES = '[name=allowed_audiences] input';
export const FIELD_ALLOWED_AUDIENCES_VALUE = 'Allowed audiences';
export const FIELD_ALLOWED_AUDIENCES_ADD_BTN =
  '[name=allowed_audiences] button';
export const FIELD_ALLOWED_AUDIENCES_DELETE_BTN =
  '[name=allowed_audiences] tbody td:last-child button[aria-label=Remove]';
export const FIELD_CLAIMS_SCOPES = '[name=claims_scopes] input';
export const FIELD_CLAIMS_SCOPES_VALUE = 'Claim scopes';
export const FIELD_CLAIMS_SCOPES_ADD_BTN = '[name=claims_scopes] button';
export const FIELD_CLAIMS_SCOPES_DELETE_BTN =
  '[name=claims_scopes] tbody td:last-child button[aria-label=Remove]';
export const FIELD_ACCOUNT_CLAIM_MAPS_FROM_CLAIM =
  '[name=account_claim_maps] tbody td:nth-of-type(1) input';
export const FIELD_ACCOUNT_CLAIM_MAPS_FROM_CLAIM_VALUE = 'from_claim';
export const FIELD_ACCOUNT_CLAIM_MAPS_TO_CLAIM =
  '[name=account_claim_maps] tbody td:nth-of-type(2) select';
export const FIELD_ACCOUNT_CLAIM_MAPS_TO_CLAIM_VALUE = 'email';
export const FIELD_ACCOUNT_CLAIM_MAPS_ADD_BTN =
  '[name=account_claim_maps] button';
export const FIELD_ACCOUNT_CLAIM_MAPS_DELETE_BTN =
  '[name=account_claim_maps] tbody td:last-child button[aria-label=Remove]';
export const FIELD_IDP_CERTS = '[name=idp_ca_certs] textarea';
export const FIELD_IDP_CERTS_VALUE = 'IDP certificates';
export const FIELD_IDP_CERTS_ADD_BTN = '[name=idp_ca_certs] button';
export const FIELD_IDP_CERTS_DELETE_BTN =
  '[name=idp_ca_certs] tbody td:last-child button[aria-label=Remove]';
export const FIELD_MAX_AGE = '[name=max_age]';
export const FIELD_MAX_AGE_VALUE = '5';
export const FIELD_API_URL_PREFIX = '[name=api_url_prefix]';
export const FIELD_API_URL_PREFIX_VALUE = 'Api url prefix';
export const FIELD_PROMPTS = '[name=prompts]';
export const FIELD_PROMPTS_CONSENT = '[id=consent]';
export const FIELD_PROMPTS_SELECT_ACCOUNT = '[id=select_account]';
export const NEW_DROPDOWN = '[data-test-new-dropdown] button';
export const FIELD_URLS = '[name=urls]';
export const FIELD_URLS_VALUE = 'url1,url2';
export const FIELD_CERTIFICATES = '[name=certificates] textarea';
export const FIELD_CERTIFICATES_VALUE = 'certificate';
export const FIELD_CERTIFICATES_ADD_BTN = '[name=certificates] button';
export const FIELD_CERTIFICATES_DELETE_BTN =
  '[name="certificates"] button[aria-label=Remove]';
export const FIELD_CLIENT_CERTIFICATE = '[name=client_certificate]';
export const FIELD_CLIENT_CERTIFICATE_VALUE = 'Client certificate value';
export const FIELD_CLIENT_CERTIFICATE_KEY = '[name=client_certificate_key]';
export const FIELD_CLIENT_CERTIFICATE_KEY_VALUE =
  'Client certificate key value';
export const FIELD_START_TLS = '[name=start_tls]';
export const FIELD_INSECURE_TLS = '[name=insecure_tls]';
export const FIELD_BIND_DN = '[name=bind_dn]';
export const FIELD_BIND_DN_VALUE = 'Bind dn';
export const FIELD_BIND_PASSWORD = '[name=bind_password]';
export const FIELD_BIND_PASSWORD_VALUE = 'Bind password value';
export const FIELD_UPN_DOMAIN = '[name=upn_domain]';
export const FIELD_UPN_DOMAIN_VALUE = 'Upn domain value';
export const FIELD_DISCOVER_DN = '[name=discover_dn]';
export const FIELD_ANON_GROUP_SEARCH = '[name=anon_group_search]';
export const FIELD_USER_DN = '[name=user_dn]';
export const FIELD_USER_DN_VALUE = 'User dn value';
export const FIELD_USER_ATTR = '[name=user_attr]';
export const FIELD_USER_ATTR_VALUE = 'User attribute value';
export const FIELD_USER_FILTER = '[name=user_filter]';
export const FIELD_USER_FILTER_VALUE = 'User filter value';
export const FIELD_ACCOUNT_ATTRIBUTE_MAPS_FROM =
  '[name=account_attribute_maps] input';
export const FIELD_ACCOUNT_ATTRIBUTE_MAPS_FROM_VALUE = 'attribute';
export const FIELD_ACCOUNT_ATTRIBUTE_MAPS_TO =
  '[name=account_attribute_maps] select';
export const FIELD_ACCOUNT_ATTRIBUTE_MAPS_TO_VALUE = 'email';
export const FIELD_ACCOUNT_ATTRIBUTE_MAPS_ADD_BTN =
  '[name=account_attribute_maps] button';
export const FIELD_ACCOUNT_ATTRIBUTE_MAPS_DELETE_BTN =
  '[name=account_attribute_maps] button[aria-label=Remove]';
export const FIELD_GROUP_DN = '[name=group_dn]';
export const FIELD_GROUP_DN_VALUE = 'Group dn value';
export const FIELD_GROUP_ATTR = '[name=group_attr]';
export const FIELD_GROUP_ATTR_VALUE = 'Group attribute value';
export const FIELD_GROUP_FILTER = '[name=group_filter]';
export const FIELD_GROUP_FILTER_VALUE = 'Group filter value';
export const FIELD_ENABLE_GROUPS = '[name=enable_groups]';
export const FIELD_USE_TOKEN_GROUPS = '[name=use_token_groups]';

export const MANAGE_DROPDOWN = '[data-test-manage-auth-method] button';
export const MANAGE_DROPDOWN_MAKE_PRIMARY =
  '[data-test-manage-auth-method] ul li:first-child button';
export const MANAGE_DROPDOWN_DELETE =
  '[data-test-manage-auth-method] ul li:last-child button';

export const TABLE_FIRST_ROW_ACTION_FIRST_ITEM =
  'tbody tr:first-child td:last-child ul li:first-child button';

export const SEARCH_BAR_INPUT = '[type=search]';

export const TABLE_ACTION_DROPDOWN = (authMethodId) =>
  `tbody [data-test-auth-methods-table-row="${authMethodId}"] .hds-table__td:last-child .hds-dropdown button`;
export const TABLE_ACTION_DROPDOWN_MAKE_PRIMARY = (authMethodId) =>
  `tbody tr[data-test-auth-methods-table-row="${authMethodId}"] td:last-child ul li:first-child button`;
export const TABLE_ROW_TYPE = (authMethodId) =>
  `tbody [data-test-auth-methods-table-row="${authMethodId}"] .hds-table__td:nth-child(2)`;
export const TABLE_ROW_NAME_LINK = (authMethodId) =>
  `tbody [data-test-auth-methods-table-row="${authMethodId}"] .hds-table__td:first-child a`;

export const CHANGE_STATE_DROPDOWN =
  '[data-test-change-state] button:first-child';
export const CHANGE_STATE_DROPDOWN_CHECKED =
  '[data-test-change-state] input:checked';
export const CHANGE_STATE_DROPDOWN_STATE = (state) =>
  `[data-test-change-state] input[value="${state}"]`;
