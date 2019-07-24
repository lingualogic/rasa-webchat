import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { ServiceManager, SPEECH_LISTEN_SERVICE } from 'speech-react';

import Microphone from './../Microphone';
import send from 'assets/send_button.svg';
import './style.scss';


class Sender extends Component {


  constructor(props) {
    super(props);
    this.listenResultEvent = null;
    this.listenService = ServiceManager.get(SPEECH_LISTEN_SERVICE);
  }


  componentDidMount() {
    if (this.listenService) {
      this.listenResultEvent = this.listenService.resultEvent.subscribe((listenResult) => {
        // console.log('Listen-Text:', listenResult);
        const inputDom = document.getElementById('inputText');
        // console.log('InputDom:', inputDom);
        inputDom.value = listenResult;
        // this.forceUpdate();
      });
    }
  }


  componentWillUnmount() {
    if (this.listenResultEvent) this.listenResultEvent.unsubscribe();
  }


  render() {
    return (
      <form className="sender" onSubmit={this.props.sendMessage}>
        <Microphone />
        <input type="text" className="new-message" name="message" id="inputText" placeholder={this.props.inputFieldTextHint} disabled={this.props.disabledInput} autoFocus autoComplete="off" />
        <button type="submit" className="send">
          <img src={send} className="send-icon" alt="send" />
        </button>
      </form>
    );
  }

}


Sender.propTypes = {
  sendMessage: PropTypes.func,
  inputFieldTextHint: PropTypes.string,
  disabledInput: PropTypes.bool
};


const mapStateToProps = state => ({
  inputFieldTextHint: state.behavior.get('inputFieldTextHint')
});


export default connect(mapStateToProps)(Sender);
