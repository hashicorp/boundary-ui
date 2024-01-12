import Service from '@ember/service';
import { inject as service } from '@ember/service';

export default class ControllerCheckService extends Service {
  // =services

  @service store;
  @service ipc;

  // =attributes

  #isPaginationSupported = false;

  // =methods

  get isPaginationSupported() {
    return this.#isPaginationSupported;
  }

  async checkPaginationSupport() {
    const adapter = this.store.adapterFor('application');
    const scopeSchema = this.store.modelFor('scope');

    try {
      const scopesCheck = await adapter.query(this.store, scopeSchema, {
        page_size: 1,
        recursive: true,
      });
      if (scopesCheck.list_token) {
        // this.#isPaginationSupported = true;
        this.#isPaginationSupported = false;
      }
    } catch (e) {
      // no op
    }
  }

  async findDownloadLink() {
    let downloadLink;
    let downloadError = false;

    if (!this.isPaginationSupported) {
      const metaDataUrl =
        'https://api.releases.hashicorp.com/v1/releases/boundary-desktop/1.7.1';
      const { isWindows, isMac, isLinux } = await this.ipc.invoke('checkOS');

      try {
        // throw new Error('TEST');
        const metaDataResponse = await fetch(metaDataUrl);
        const metaData = await metaDataResponse.json();

        if (isWindows) {
          downloadLink = this.extractOsSpecificUrl(metaData, 'windows', '.zip');
        } else if (isMac) {
          downloadLink = this.extractOsSpecificUrl(metaData, 'darwin', '.dmg');
        } else if (isLinux) {
          downloadLink = this.extractOsSpecificUrl(metaData, 'linux', '.deb');
        }

        if (!downloadLink) throw new Error('No build found');
      } catch (e) {
        // this is a catch for any errors that may occur and shows the user
        // an error alert directing them to the releases page
        downloadError = true;
      }
    }

    return { downloadLink, downloadError };
  }

  extractOsSpecificUrl(metaData, os, fileExtension) {
    const build = metaData.builds.find(
      (build) => build.os === os && build.url.endsWith(fileExtension),
    );

    return build?.url;
  }
}
