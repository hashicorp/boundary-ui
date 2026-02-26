import Button from '@hashicorp/design-system-components/components/hds/button/index';
import t from 'ember-intl/helpers/t';
import AsciinemaPlayer from 'admin/components/session-recording/player/asciinema-player';
<template>
  {{!
  Copyright IBM Corp. 2021, 2026
  SPDX-License-Identifier: BUSL-1.1
}}

  <div class='session-recording-player'>
    <div class='session-recording-player-header'>
      <Button
        @icon='arrow-left'
        @text={{t 'resources.session-recording.channel.player.back-navigation'}}
        @color='tertiary'
        @route={{@route}}
        @model={{@model}}
      />
    </div>
    {{#if (has-block)}}
      {{yield}}
    {{else}}
      <div class='session-recording-player-theme'>
        <AsciinemaPlayer @data={{@asciicast}} @poster='npt:1:30' />
      </div>
    {{/if}}
  </div>
</template>
