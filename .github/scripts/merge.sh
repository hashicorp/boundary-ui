#!/usr/bin/env bash
# Copyright IBM Corp. 2021, 2026
# SPDX-License-Identifier: BUSL-1.1


set -euo pipefail

# Configure Git
git config --global user.email "hc-github-team-secure-boundary@hashicorp.com"
git config --global user.name "github-team-secure-boundary"
# Fetch branches from ENT
git fetch origin
BRANCH=${1}

echo "BRANCH to merge is $BRANCH"
git checkout "${BRANCH}"

# Checkout OSS repo
git remote add oss-remote https://github.com/hashicorp/boundary-ui.git
git fetch oss-remote

# Merge oss/${BRANCH} into ent/${BRANCH}
git_merge_branch="${2}"
git checkout -b "${git_merge_branch}"
latest_oss_commit="$(git rev-parse --short oss-remote/${BRANCH})"
echo "Trying to merge the latest oss commit - ${latest_oss_commit} from oss/${BRANCH} into ent/${BRANCH}"

if ! errors=$(git merge -m "Merge Boundary UI OSS branch '${BRANCH}' at commit ${latest_oss_commit}" "${latest_oss_commit}"); then
  # Here we can try to auto resolve conflicts
  # This logic will vary from project to project. The below is just an example.
  conflicts=$(git diff --name-only --diff-filter=U)
  printf "Found conflicts:\n${conflicts}\n"
  # Resolve package.json conflicts by taking oss
  if echo "$conflicts" | grep -q package.json; then
    echo "Checking out oss package.json..."
    git checkout --theirs package.json
    git add package.json
  fi
  # Resolve pnpm-lock.yaml conflicts by re-running pnpm install:
  # https://pnpm.io/git#merge-conflicts
  if echo "$conflicts" | grep -q pnpm-lock.yaml; then
    echo "Re-running pnpm install to fix conflicts by regenerating pnpm-lock.yaml..."
    pnpm install
    git add pnpm-lock.yaml
  fi

  # If we can commit all the changes without conflict, we have resolved everything automatically
  if ! git commit --no-edit; then
    echo "Auto Merge failed, creating a draft PR"
    git merge --abort
    git clean -xfd
    git fetch oss-remote
    git checkout "${OSS_BRANCH}"
    git checkout -b "${OSS_LOCAL_BRANCH}"
    git push -f --set-upstream origin "${OSS_LOCAL_BRANCH}"
    gh pr create \
      --draft \
      --fill-first \
      --label "oss-merge" \
      -B "${BASE_BRANCH}" \
      -H "${OSS_LOCAL_BRANCH}" \
      -a "${ACTOR}" \
      -t "[${BASE_BRANCH/oss\/release\//}] OSS to ENT merge of (${SHA::7})" \
      -b "${BASE_BRANCH/oss\//} upstream merge of (${SHA::7})
      Merge failed, Please fix the conflicts using github UI or using the following commands:
      \`\`\`bash
      git checkout ${BASE_BRANCH}
      git pull
      git checkout ${OSS_LOCAL_BRANCH}
      git merge ${BASE_BRANCH}
      # fix conflicts and commit
      git push origin ${OSS_LOCAL_BRANCH}
      \`\`\`"
    exit 0
  fi
fi

# Check that there are actually changes to merge by comparing the
# merge branch to the current checked out branch
if (git diff ${BRANCH} --exit-code > /dev/null); then
  echo "there are no changes to merge"
  exit 0
fi
git push origin "${git_merge_branch}"
gh pr create \
  --fill-first \
  --label "oss-merge" \
  -B "${BASE_BRANCH}" \
  -H "${MERGE_BRANCH}" \
  -a ${ACTOR} \
  -t "[${BASE_BRANCH/oss\/release\//}] OSS to ENT merge of (${SHA::7})" \
  -b "${BASE_BRANCH/oss\//} upstream merge of (${SHA::7})"
gh pr merge --auto --merge

# This PR will be need to be approved manually
