# Rasa Endpoint Configuration

## Set Credentials

In ```credentials.yml```: 

    socketio:
      user_message_evt: user_uttered
      bot_message_evt: bot_uttered
      session_persistence: true

## Run Rasa on localhost:5005

    $ rasa run -m models --enable-api

## Run Webchat

    $ npm run dev