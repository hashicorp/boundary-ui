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

  const addToSourcesList = (originalSourcesIds, selectedSourcesIds) => {
    const listOfSources = new Set(originalSourcesIds);
    for (const elem of selectedSourcesIds) {
      listOfSources.add(elem);
    }
    return Array.from(listOfSources);
  };

  const removeFromSourcesList = (originalSourceIds, selectedSourceIds) => {
    const listOfSources = new Set(originalSourceIds);
    for (const elem of selectedSourceIds) {
      listOfSources.delete(elem);
    }
    return Array.from(listOfSources);
  };

  // If adding host sources, push them into the array
  if (method === 'add-host-sources') {
    if (selectedHostSourceIds) {
      const listOfHostSources = addToSourcesList(
        originHostSetIds,
        selectedHostSourceIds
      );
      if (listOfHostSources?.length) {
        updatedAttrs.hostSetIds = listOfHostSources;
      }
    }
  }
  // If deleting host sources, filter them out of the array
  if (method === 'remove-host-sources') {
    if (selectedHostSourceIds) {
      const removedHostSources = removeFromSourcesList(
        originHostSetIds,
        selectedHostSourceIds
      );
      updatedAttrs.hostSetIds = removedHostSources;
    }
  }
  // If adding brokered or injected application cred sources, push them into the array
  if (method === 'add-credential-sources') {
    if (selectedBrokeredCredentials) {
      const listOfBrokeredCredentialSources = addToSourcesList(
        originalBrokeredCredentials,
        selectedBrokeredCredentials
      );
      if (listOfBrokeredCredentialSources?.length) {
        updatedAttrs.brokeredCredentialSourceIds =
          listOfBrokeredCredentialSources;
        target.attributes.brokeredCredentialSourceIds =
          listOfBrokeredCredentialSources;
      }
    }

    if (selectedInjectedCredentials) {
      const listOfInjectedCredentialSources = addToSourcesList(
        originalInjectedCredentials,
        selectedInjectedCredentials
      );
      if (listOfInjectedCredentialSources?.length) {
        updatedAttrs.injectedApplicationCredentialSourceIds =
          listOfInjectedCredentialSources;
      }
    }
  }
  // If deleting brokered or injected application cred sources, filter them out of the array
  if (method === 'remove-credential-sources') {
    if (selectedBrokeredCredentials) {
      const removedCredentialSources = removeFromSourcesList(
        originalBrokeredCredentials,
        selectedBrokeredCredentials
      );
      updatedAttrs.brokeredCredentialSourceIds = removedCredentialSources;
      target.attributes.brokeredCredentialSourceIds = removedCredentialSources;
    }

    if (selectedInjectedCredentials) {
      const removedCredentialSources = removeFromSourcesList(
        originalInjectedCredentials,
        selectedInjectedCredentials
      );
      updatedAttrs.injectedApplicationCredentialSourceIds =
        removedCredentialSources;
      target.attributes.injectedApplicationCredentialSourceIds =
        removedCredentialSources;
    }
  }
  return target.update(updatedAttrs);
}
