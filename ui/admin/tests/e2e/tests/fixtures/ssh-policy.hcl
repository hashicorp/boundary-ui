# Copyright (c) HashiCorp, Inc.
# SPDX-License-Identifier: MPL-2.0

path "e2e_secrets/issue/boundary-client" {
  capabilities = ["create", "update"]
}

path "e2e_secrets/sign/boundary-client" {
  capabilities = ["create", "update"]
}
