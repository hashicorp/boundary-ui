import Controller from '@ember/controller';
import { action } from '@ember/object';
import { loading } from 'ember-loading';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';

export default class ScopesController extends Controller {
  // =services

  @service ipc;
  @service intl;
  @service flashMessages;

  // =attributes

  metaData;
  url;
  @tracked error = false;

  // =methods

  @action
  @loading
  async downloadAndInstallCompatiableVersion() {
    const metaDataUrl =
      'https://api.releases.hashicorp.com/v1/releases/boundary-desktop/1.7.1';
    const { isWindows, isMac, isLinux } = await this.ipc.invoke('checkOS');

    try {
      const metaDataResponse = await fetch(metaDataUrl);
      this.metaData = await metaDataResponse.json();

      if (isWindows) {
        this.extractOsSpecificUrl('windows');
      } else if (isMac) {
        this.extractOsSpecificUrl('darwin');
      } else if (isLinux) {
        this.extractOsSpecificUrl('linux');
      }

      const response = await fetch(this.url);
      const blob = await response.blob();

      const urlParts = this.url.split('/');
      const fileName = urlParts[urlParts.length - 1];

      // Create an anchor element to trigger the download
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = fileName;

      // Simulate click to trigger download
      link.click();
    } catch (e) {
      // this is a catch all for any errors that may occur and shows the user
      // an error alert directing them to the releases page
      this.error = true;
    }
  }

  extractOsSpecificUrl(os) {
    this.url = this.metaData.builds.find((build) => build.os === os).url;
  }
}
