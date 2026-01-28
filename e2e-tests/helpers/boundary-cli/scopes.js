/**
 * Copyright IBM Corp. 2024, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { execSync } from 'node:child_process';
import { nanoid } from 'nanoid';

/**
 * Creates an org
 * @returns {Promise<string>} new org's id
 */
export async function createOrg() {
  const orgName = 'Org ' + nanoid();
  let newOrg;
  try {
    newOrg = JSON.parse(
      execSync(
        `boundary scopes create \
        -name="${orgName}" \
        -scope-id=global \
        -format json`,
      ),
    ).item;
  } catch (e) {
    console.log(`${e.stderr}`);
  }
  return newOrg.id;
}

/**
 * Creates a project
 * @param {string} orgId ID of the organization under which the project will be created.
 * @returns {Promise<string>} new project's ID
 */
export async function createProject(orgId) {
  const projectName = 'Project ' + nanoid();
  let newProject;
  try {
    newProject = JSON.parse(
      execSync(
        `boundary scopes create \
        -name="${projectName}" \
        -scope-id=${orgId} \
        -format json`,
      ),
    ).item;
  } catch (e) {
    console.log(`${e.stderr}`);
  }
  return newProject.id;
}

/**
 * Deletes the specified scope
 * @param {string} scopeId ID of the scope to be deleted
 */
export async function deleteScope(scopeId) {
  try {
    execSync('boundary scopes delete -id=' + scopeId);
  } catch (e) {
    console.log(`${e.stderr}`);
  }
}

/**
 * Gets Org ID from Org Name
 * @param {string} orgName Name of the org
 * @returns {Promise<string>} ID of the org
 */
export async function getOrgIdFromName(orgName) {
  const orgs = JSON.parse(execSync('boundary scopes list -format json'));
  const org = orgs.items.filter((obj) => obj.name == orgName)[0];
  if (org) {
    return org.id;
  }
  return null;
}

/**
 * Gets Project ID from Project Name
 * @param {string} orgId Id of the org under which the project exists
 * @param {string} projectName Name of the project
 * @returns {Promise<string>} ID of the project
 */
export async function getProjectIdFromName(orgId, projectName) {
  const projects = JSON.parse(
    execSync(`boundary scopes list -scope-id ${orgId} -format json`),
  );
  const project = projects.items.filter((obj) => obj.name == projectName)[0];
  if (project) {
    return project.id;
  }
  return null;
}

/**
 * Makes an auth-method primary.
 * @param {string} scopeId ID of the scope that the auth-method belongs to
 * @param {string} authMethodId ID of the auth method that will be made primary
 */
export async function makeAuthMethodPrimary(scopeId, authMethodId) {
  try {
    execSync(
      `boundary scopes update \
        -id=${scopeId} \
        -primary-auth-method-id ${authMethodId} \
        -format json`,
    );
  } catch (e) {
    console.log(`${e.stderr}`);
  }
}
