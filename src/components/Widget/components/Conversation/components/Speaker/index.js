import React, { Component } from 'react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { ServiceManager, SPEECH_SPEAK_SERVICE } from 'speech-react';

import './speaker.scss';


class Speaker extends Component {


  constructor() {
    super();
    this.speakService = ServiceManager.get(SPEECH_SPEAK_SERVICE);
  }

  toggleSpeak() {
    if (this.speakService) {
      if (this.speakService.active) {
        this.speakService.active = false;
      } else {
        this.speakService.active = true;
      }
      this.forceUpdate();
    }
  }

  isSpeak() {
    if (this.speakService) {
      return this.speakService.active;
    }
    return false;
  }


  render() {
    return (
      <div>
        <div className="speaker">
          { this.isSpeak() ?
            <div id="speaker-active" className="button--speaker-active" onClick={() => this.toggleSpeak()}>
              <FontAwesomeIcon className="circle" icon="volume-up" />
            </div>
            :
            <div id="speaker" className="button--speaker" onClick={() => this.toggleSpeak()}>
              <FontAwesomeIcon className="circle" icon="volume-off" />
            </div>
          }
        </div>
      </div>
    );
  }

}

export default Speaker;
