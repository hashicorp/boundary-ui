export function targetHandler({ targets }, { params: { idMethod } }) {
  const attrs = this.normalizedRequestAttrs();
  const id = idMethod.split(':')[0];
  const method = idMethod.split(':')[1];
  const target = targets.find(id);
  const {
    attributes: {
      brokeredCredentialSourceIds: originalBrokeredCredentials,
      injectedApplicationCredentialSourceIds: originalInjectedCredentials,
    },
  } = target;
  const selectedBrokeredCredentials = attrs.brokeredCredentialSourceIds;
  const selectedInjectedCredentials =
    attrs.injectedApplicationCredentialSourceIds;
  const selectedHostSourceIds = attrs.hostSourceIds;
  const originHostSetIds = target.hostSetIds;

  const updatedAttrs = {
    version: attrs.version,
  };

  const addToCredentialSourcesList = (
    originalCredentials,
    selectedCredentials
  ) => {
    selectedCredentials.forEach((id) => {
      if (!originalCredentials.includes(id)) {
        originalCredentials.push(id);
      }
    });
    return originalCredentials;
  };

  const removeFromCredentialSourcesList = (
    originalCredentials,
    selectedCredentials
  ) =>
    originalCredentials.filter((item) => !selectedCredentials.includes(item));

  // If adding host sources, push them into the array
  if (method === 'add-host-sources') {
    updatedAttrs.hostSetIds = originHostSetIds;
    selectedHostSourceIds.forEach((id) => {
      if (!updatedAttrs.hostSetIds.includes(id)) {
        updatedAttrs.hostSetIds.push(id);
      }
    });
  }
  // If deleting host sources, filter them out of the array
  if (method === 'remove-host-sources') {
    updatedAttrs.hostSetIds = originHostSetIds;
    updatedAttrs.hostSetIds = updatedAttrs.hostSetIds.filter((id) => {
      return !selectedHostSourceIds.includes(id);
    });
  }

  if (method === 'add-credential-sources') {
    if (selectedBrokeredCredentials) {
      const mergedCredentialSources = addToCredentialSourcesList(
        originalBrokeredCredentials,
        selectedBrokeredCredentials
      );
      if (mergedCredentialSources?.length) {
        updatedAttrs.brokeredCredentialSourceIds = mergedCredentialSources;
      }
    }

    if (selectedInjectedCredentials) {
      const mergedCredentialSources = addToCredentialSourcesList(
        originalInjectedCredentials,
        selectedInjectedCredentials
      );
      if (mergedCredentialSources?.length) {
        updatedAttrs.injectedApplicationCredentialSourceIds =
          mergedCredentialSources;
      }
    }
  }

  if (method === 'remove-credential-sources') {
    if (selectedBrokeredCredentials) {
      const removedCredentialSources = removeFromCredentialSourcesList(
        originalBrokeredCredentials,
        selectedBrokeredCredentials
      );
      updatedAttrs.brokeredCredentialSourceIds = removedCredentialSources;
      target.attributes.brokeredCredentialSourceIds = removedCredentialSources;
    }

    if (selectedInjectedCredentials) {
      const removedCredentialSources = removeFromCredentialSourcesList(
        originalBrokeredCredentials,
        selectedBrokeredCredentials
      );
      updatedAttrs.injectedApplicationCredentialSourceIds =
        removedCredentialSources;
      target.attributes.injectedApplicationCredentialSourceIds =
        removedCredentialSources;
    }
  }
  return target.update(updatedAttrs);
}
