import { Box, Button, Flex, HStack, IconButton, Input, Text, VStack } from '@chakra-ui/react';
import { PhoneIcon, CopyIcon } from '@chakra-ui/icons';
import React, { useState, useEffect, useRef } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import Peer from 'simple-peer';

// import global from 'global';
// import * as process from 'process';
// global.process = process;

import io from 'socket.io-client';
import './App.css';

const socket = io.connect('http://localhost:3000');

function App() {
  const [me, setMe] = useState('');
  const [stream, setStream] = useState();
  const [receivingCall, setReceivingCall] = useState(false);
  const [caller, setCaller] = useState('');
  const [callerSignal, setCallerSignal] = useState();
  const [callAccepted, setCallAccepted] = useState(false);
  const [idToCall, setIdToCall] = useState('');
  const [callEnded, setCallEnded] = useState(false);
  const [name, setName] = useState('');

  const myVideo = useRef({});
  const userVideo = useRef({});
  const connectionRef = useRef();

  useEffect(() => {
    // Ask user permission to use webcam
    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
      setStream(stream);
      myVideo.current.srcObject = stream; // set the ref of myVideo to the stream coming in from the webcam
    });

    socket.on('me', (id) => {
      // first socket.emit on the backend, which is going to emit socket.id
      setMe(id); // set me to the emited socket.id from the backend
    });

    socket.on('callUser', (data) => {
      setReceivingCall(true);
      setCaller(data.from);
      setName(data.name);
      setCallerSignal(data.signal);
    });
  }, []);

  const callUser = (id) => {
    // funcitonality to call a user using simple peer library: a wrapper for WebRTC

    console.log('gets here');

    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream: stream,
    });

    console.log(peer);

    peer.on('signal', (data) => {
      // when a peer is created, emit callUser with the following data
      socket.emit('callUser', {
        userToCall: id,
        signalData: data,
        from: me,
        name: name,
      });
    });

    peer.on('stream', (stream) => {
      userVideo.current.srcObject = stream; // get the other person's video and set it to stream
    });

    // add the callAccepted socket and set the peer signal
    socket.on('callAccepted', (signal) => {
      setCallAccepted(true);
      peer.signal(signal);
    });

    // set the connectionRef to peer, so we can disable that once the call ends
    connectionRef.current = peer;
  };

  const answerCall = () => {
    setCallAccepted(true);

    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream: stream,
    });

    peer.on('signal', (data) => {
      socket.emit('answerCall', { signal: data, to: caller });
    });

    peer.on('stream', (stream) => {
      userVideo.current.srcObject = stream;
    });

    peer.signal(callerSignal);
    connectionRef.current = peer;
  };

  const leaveCall = () => {
    setCallEnded(true);
    connectionRef.current.destroy(); // This ends the connection
  };

  return (
    <VStack background="#008af3" height="auto" minHeight="100%" py={8}>
      <Text fontSize="2rem" fontWeight="bold" textAlign="center" color="#FFF">
        TalentPlus Video Call
      </Text>

      <VStack gap={7}>
        <Flex gap={2}>
          <Box>
            {stream ? (
              <video
                playsInline
                muted
                ref={myVideo}
                autoPlay
                style={{ width: '30rem', borderRadius: '10px' }}
              />
            ) : (
              <Text fontSize="2rem" color="#FFF">
                Loading...
              </Text>
            )}
          </Box>

          <Box>
            {callAccepted && !callEnded ? (
              <video playsInline ref={userVideo} autoPlay style={{ width: '30rem' }} />
            ) : null}
          </Box>
        </Flex>

        <Box
          borderRadius={4}
          background="#FFF"
          width="25rem"
          height="20rem"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <VStack width="15rem" gap={5}>
            <Input
              variant="filled"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <CopyToClipboard text={me} style={{ width: '15rem' }}>
              <Button
                variant="solid"
                color="#FFF"
                background="#008af3"
                leftIcon={<CopyIcon />}
                _hover={{ background: '#005da3' }}
              >
                Copy ID
              </Button>
            </CopyToClipboard>

            <Input
              placeholder="ID to call"
              variant="filled"
              value={idToCall}
              onChange={(e) => setIdToCall(e.target.value)}
            />

            <Box>
              {callAccepted && !callEnded ? (
                <Button variant="outline" color="#FFF" background="#008af3" onClick={leaveCall}>
                  End Call
                </Button>
              ) : (
                <Button
                  width="15rem"
                  variant="outline"
                  color="#008af3"
                  colorScheme="#008af3"
                  aria-label="call"
                  onClick={() => callUser(idToCall)}
                  size="lg"
                  leftIcon={<PhoneIcon />}
                  _hover={{ color: '#008af3', colorScheme: '#008af3' }}
                >
                  Call
                </Button>
              )}
              {idToCall}
            </Box>
          </VStack>
        </Box>

        <div>
          {receivingCall && !callAccepted ? (
            <div className="caller">
              <h1>{name} is calling...</h1>
              <Button variant="container" color="primary" onClick={answerCall}>
                Answer
              </Button>
            </div>
          ) : null}
        </div>
      </VStack>
    </VStack>
  );
}

export default App;
