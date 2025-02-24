/* eslint-disable no-undef */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { ServiceManager, SPEECH_SPEAK_SERVICE } from 'speech-react';

import {
  toggleChat,
  openChat,
  showChat,
  addUserMessage,
  emitUserMessage,
  addResponseMessage,
  addLinkSnippet,
  addVideoSnippet,
  addImageSnippet,
  addQuickReply,
  initialize,
  connectServer,
  disconnectServer,
  pullSession
} from 'actions';

import { isSnippet, isVideo, isImage, isQR, isText } from './msgProcessor';
import WidgetLayout from './layout';
import { storeLocalSession, getLocalSession } from '../../store/reducers/helper';
import { SESSION_NAME, NEXT_MESSAGE } from 'constants';

class Widget extends Component {

  constructor(props) {
    super(props);
    this.messages = [];
    this.speakService = ServiceManager.get(SPEECH_SPEAK_SERVICE);
    setInterval(() => {
      if (this.messages.length > 0) {
        this.dispatchMessage(this.messages.shift());
      }
    }, this.props.interval);
  }


  componentDidMount() {
    const { socket, storage } = this.props;

    socket.on('bot_uttered', (botUttered) => {
      this.messages.push(botUttered);
    });

    this.props.dispatch(pullSession());

    // Request a session from server
    const localId = this.getSessionId();
    socket.on('connect', () => {
      socket.emit('session_request', ({ 'session_id': localId }));
    });

    // When session_confirm is received from the server:
    socket.on('session_confirm', (remoteId) => {
      console.log(`session_confirm:${socket.id} session_id:${remoteId}`);

      // Store the initial state to both the redux store and the storage, set connected to true
      this.props.dispatch(connectServer());

      /*
      Check if the session_id is consistent with the server
      If the local_id is null or different from the remote_id,
      start a new session.
      */
      if (localId !== remoteId) {
        // storage.clear();
        // Store the received session_id to storage

        storeLocalSession(storage, SESSION_NAME, remoteId);
        this.props.dispatch(pullSession());
        this.trySendInitPayload();
      } else {
        // If this is an existing session, it's possible we changed pages and want to send a
        // user message when we land.
        const nextMessage = window.localStorage.getItem(NEXT_MESSAGE);

        if (nextMessage !== null) {
          const { message, expiry } = JSON.parse(nextMessage);
          window.localStorage.removeItem(NEXT_MESSAGE);

          if (expiry === 0 || expiry > Date.now()) {
            this.props.dispatch(addUserMessage(message));
            this.props.dispatch(emitUserMessage(message));
          }
        }
      }
    });

    socket.on('disconnect', (reason) => {
      console.log(reason);
      if (reason !== 'io client disconnect') {
        this.props.dispatch(disconnectServer());
      }
    });

    if (this.props.embedded && this.props.initialized) {
      this.props.dispatch(showChat());
      this.props.dispatch(openChat());
    }
  }

  componentDidUpdate() {
    this.props.dispatch(pullSession());
    this.trySendInitPayload();
    if (this.props.embedded && this.props.initialized) {
      this.props.dispatch(showChat());
      this.props.dispatch(openChat());
    }
  }

  componentWillUnmount() {
    const { socket } = this.props;
    socket.close();
  }

  getSessionId() {
    const { storage } = this.props;
    // Get the local session, check if there is an existing session_id
    const localSession = getLocalSession(storage, SESSION_NAME);
    const localId = localSession ? localSession.session_id: null;
    return localId;
  }

  // TODO: Need to erase redux store on load if localStorage
  // is erased. Then behavior on reload can be consistent with
  // behavior on first load

  trySendInitPayload = () => {
    const {
      initPayload,
      customData,
      socket,
      initialized,
      isChatOpen,
      isChatVisible,
      embedded,
      connected
    } = this.props;

    // Send initial payload when chat is opened or widget is shown
    if (!initialized && connected && (((isChatOpen && isChatVisible) || embedded))) {
      // Only send initial payload if the widget is connected to the server but not yet initialized

      const sessionId = this.getSessionId();

      // check that session_id is confirmed
      if (!sessionId) return;
      console.log("sending init payload", sessionId);
      socket.emit('user_uttered', { message: initPayload, customData, session_id: sessionId });
      this.props.dispatch(initialize());
    }
  }

  toggleConversation = () => {
    this.props.dispatch(toggleChat());
  };

  speak(text) {
    if (this.speakService) {
      if (this.speakService.active) {
        this.speakService.language = 'en';
        this.speakService.text = text;
        this.speakService.start();
      }
    }
  }

  dispatchMessage(message) {
    // console.log('Message:', message);
    if (Object.keys(message).length === 0) {
      return;
    }
    if (message.text) {
      // console.log('Textnachricht:', message.text);
      this.speak(message.text);
    }
    if (isText(message)) {
      this.props.dispatch(addResponseMessage(message.text));
    } else if (isQR(message)) {
      this.props.dispatch(addQuickReply(message));
    } else if (isSnippet(message)) {
      const element = message.attachment.payload.elements[0];
      this.props.dispatch(addLinkSnippet({
        title: element.title,
        content: element.buttons[0].title,
        link: element.buttons[0].url,
        target: '_blank'
      }));
    } else if (isVideo(message)) {
      const element = message.attachment.payload;
      this.props.dispatch(addVideoSnippet({
        title: element.title,
        video: element.src
      }));
    } else if (isImage(message)) {
      const element = message.attachment.payload;
      this.props.dispatch(addImageSnippet({
        title: element.title,
        image: element.src
      }));
    }
  }

  handleMessageSubmit = (event) => {
    event.preventDefault();
    const userUttered = event.target.message.value;
    if (userUttered) {
      this.props.dispatch(addUserMessage(userUttered));
      this.props.dispatch(emitUserMessage(userUttered));
    }
    event.target.message.value = '';
  };

  render() {
    return (
      <WidgetLayout
        toggleChat={this.toggleConversation}
        onSendMessage={this.handleMessageSubmit}
        title={this.props.title}
        subtitle={this.props.subtitle}
        customData={this.props.customData}
        profileAvatar={this.props.profileAvatar}
        showCloseButton={this.props.showCloseButton}
        hideWhenNotConnected={this.props.hideWhenNotConnected}
        fullScreenMode={this.props.fullScreenMode}
        isChatOpen={this.props.isChatOpen}
        isChatVisible={this.props.isChatVisible}
        badge={this.props.badge}
        embedded={this.props.embedded}
        params={this.props.params}
        openLauncherImage={this.props.openLauncherImage}
        closeImage={this.props.closeImage}
      />
    );
  }
}

const mapStateToProps = state => ({
  initialized: state.behavior.get('initialized'),
  connected: state.behavior.get('connected'),
  isChatOpen: state.behavior.get('isChatOpen'),
  isChatVisible: state.behavior.get('isChatVisible')
});

Widget.propTypes = {
  interval: PropTypes.number,
  title: PropTypes.string,
  customData: PropTypes.shape({}),
  subtitle: PropTypes.string,
  initPayload: PropTypes.string,
  profileAvatar: PropTypes.string,
  showCloseButton: PropTypes.bool,
  hideWhenNotConnected: PropTypes.bool,
  fullScreenMode: PropTypes.bool,
  isChatVisible: PropTypes.bool,
  isChatOpen: PropTypes.bool,
  badge: PropTypes.number,
  socket: PropTypes.shape({}),
  embedded: PropTypes.bool,
  params: PropTypes.object,
  connected: PropTypes.bool,
  initialized: PropTypes.bool,
  openLauncherImage: PropTypes.string,
  closeImage: PropTypes.string
};

Widget.defaultProps = {
  isChatOpen: false,
  isChatVisible: true
};

export default connect(mapStateToProps)(Widget);
