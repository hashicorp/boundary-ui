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
    const credentialSourceList = new Set(originalCredentials);
    for (const elem of selectedCredentials) {
      credentialSourceList.add(elem);
    }
    return Array.from(credentialSourceList);
  };

  const removeFromCredentialSourcesList = (
    originalCredentials,
    selectedCredentials
  ) => {
    const credentialSourceList = new Set(originalCredentials);
    for (const elem of selectedCredentials) {
      credentialSourceList.delete(elem);
    }
    return Array.from(credentialSourceList);
  };

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
  // If adding brokered or injected application cred sources, push them into the array
  if (method === 'add-credential-sources') {
    if (selectedBrokeredCredentials) {
      const listOfBrokeredCredentialSources = addToCredentialSourcesList(
        originalBrokeredCredentials,
        selectedBrokeredCredentials
      );
      console.log(
        listOfBrokeredCredentialSources,
        listOfBrokeredCredentialSources.length,
        'list of brokered'
      );
      if (listOfBrokeredCredentialSources?.length) {
        updatedAttrs.brokeredCredentialSourceIds =
          listOfBrokeredCredentialSources;
        target.attributes.brokeredCredentialSourceIds =
          listOfBrokeredCredentialSources;
      }
    }

    if (selectedInjectedCredentials) {
      const listOfInjectedCredentialSources = addToCredentialSourcesList(
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
      const removedCredentialSources = removeFromCredentialSourcesList(
        originalBrokeredCredentials,
        selectedBrokeredCredentials
      );
      updatedAttrs.brokeredCredentialSourceIds = removedCredentialSources;
      target.attributes.brokeredCredentialSourceIds = removedCredentialSources;
    }

    if (selectedInjectedCredentials) {
      const removedCredentialSources = removeFromCredentialSourcesList(
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
