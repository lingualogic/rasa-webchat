import React, { Component } from 'react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';


import { ServiceManager, SPEECH_LISTEN_SERVICE } from 'speech-react';


import './microphone.scss';


class Microphone extends Component {

  constructor(props) {
    super(props);
    this.state = { isToggleOn: true };
    this.startEvent = null;
    this.stopEvent = null;
    this.resultEvent = null;
    this.errorEvent = null;
    // Listenservice holen
    this.listenService = ServiceManager.get(SPEECH_LISTEN_SERVICE);
    if (this.listenService) {
      this.listenService.language = 'en';
    }
  }


  componentDidMount() {
    if (this.listenService) {
      this.startEvent = this.listenService.startEvent.subscribe(() => {
        console.log('StartListen');
        this.setState({ isToggleOn: false });
      });
      this.stopEvent = this.listenService.stopEvent.subscribe(() => {
        console.log('StopListen');
        this.setState({ isToggleOn: true });
      });
      this.resultEvent = this.listenService.resultEvent.subscribe((aResult) => {
        console.log('ResultListen:', aResult);
      });
      this.errorEvent = this.listenService.errorEvent.subscribe((aError) => {
        console.log('Fehler:', aError);
        this.setState({ isToggleOn: true });
      });
    }
  }


  componentWillUnmount() {
    if (this.startEvent) this.startEvent.unsubscribe();
    if (this.stopEvent) this.stopEvent.unsubscribe();
    if (this.resultEvent) this.resultEvent.unsubscribe();
    if (this.errorEvent) this.errorEvent.unsubsribe();
  }


  startListen() {
    if (this.listenService) {
      this.listenService.start();
    }
  }


  stopListen() {
    if (this.listenService) {
      this.listenService.stop();
    }
  }


  handleClick() {
    if (this.state.isToggleOn) {
      this.startListen();
    } else {
      this.stopListen();
    }
  }


  render() {
    return (
      <div>
        <div className="microphone">
          { this.state.isToggleOn ?
            <div id="microphone" className="button--microphone" onClick={() => this.handleClick()}>
              <FontAwesomeIcon icon="microphone" />
            </div>
            :
            <div id="microphone-active" className="button--microphone-active" onClick={() => this.handleClick()}>
              <FontAwesomeIcon icon="microphone" />
            </div>
          }
        </div>
      </div>
    );
  }

}

export default Microphone;
