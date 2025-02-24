import React from 'react';
import PropTypes from 'prop-types';
import { Provider } from 'react-redux';

import { library } from '@fortawesome/fontawesome-svg-core';
import { faMicrophone, faVolumeUp, faVolumeOff } from '@fortawesome/free-solid-svg-icons';

// speech-react

import { ServiceManager, MicrosoftModule, SPEECH_LISTEN_SERVICE } from 'speech-react';
import { MICROSOFT_REGION, MICROSOFT_SUBSCRIPTION_KEY } from '../credentials/microsoft-credentials';

import Widget from './components/Widget';
import { store, initStore } from '../src/store/store';
import socket from './socket';


const ConnectedWidget = (props) => {
  const sock = socket(props.socketUrl, props.customData, props.socketPath);
  const storage = props.params.storage === 'session' ? sessionStorage : localStorage;
  initStore(
    props.inputTextFieldHint,
    props.connectingText,
    sock,
    storage,
    props.docViewer,
  );
  // Icons initialisieren

  library.add(faMicrophone, faVolumeUp, faVolumeOff);

  // Speech-React

  const microsoftOptions = {
    microsoftRegion: MICROSOFT_REGION,
    microsoftSubscriptionKey: MICROSOFT_SUBSCRIPTION_KEY,
    errorOutputFlag: false
  };

  MicrosoftModule.init(microsoftOptions, (microsoftFlag) => {
    // console.log('Microsoft:', microsoftFlag);
    ServiceManager.init({ errorOutputFlag: false });
    if (microsoftFlag) {
      const listenService = ServiceManager.get(SPEECH_LISTEN_SERVICE);
      if (listenService && listenService.setASR('ASRMicrosoft') === 0) {
        console.log('Microsoft ASR');
      }
    }
  }, false);


  return (<Provider store={store}>
    <Widget
      socket={sock}
      interval={props.interval}
      initPayload={props.initPayload}
      title={props.title}
      subtitle={props.subtitle}
      customData={props.customData}
      handleNewUserMessage={props.handleNewUserMessage}
      profileAvatar={props.profileAvatar}
      showCloseButton={props.showCloseButton}
      hideWhenNotConnected={props.hideWhenNotConnected}
      fullScreenMode={props.fullScreenMode}
      badge={props.badge}
      embedded={props.embedded}
      params={props.params}
      storage={storage}
      openLauncherImage={props.openLauncherImage}
      closeImage={props.closeImage}
    />
  </Provider>);
};

ConnectedWidget.propTypes = {
  initPayload: PropTypes.string,
  interval: PropTypes.number,
  title: PropTypes.string,
  subtitle: PropTypes.string,
  socketUrl: PropTypes.string.isRequired,
  socketPath: PropTypes.string,
  customData: PropTypes.shape({}),
  handleNewUserMessage: PropTypes.func,
  profileAvatar: PropTypes.string,
  inputTextFieldHint: PropTypes.string,
  connectingText: PropTypes.string,
  showCloseButton: PropTypes.bool,
  hideWhenNotConnected: PropTypes.bool,
  fullScreenMode: PropTypes.bool,
  badge: PropTypes.number,
  embedded: PropTypes.bool,
  params: PropTypes.object,
  openLauncherImage: PropTypes.string,
  closeImage: PropTypes.string,
  docViewer: PropTypes.bool
};

ConnectedWidget.defaultProps = {
  title: 'Welcome',
  customData: {},
  interval: 2000,
  inputTextFieldHint: 'Type a message...',
  connectingText: 'Waiting for server...',
  fullScreenMode: false,
  hideWhenNotConnected: true,
  socketUrl: 'http://localhost',
  badge: 0,
  embedded: false,
  params: {
    storage: 'local'
  },
  docViewer: false
};

export default ConnectedWidget;
