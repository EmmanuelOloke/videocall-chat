import { Button, IconButton, Input } from '@chakra-ui/react';
import { PhoneIcon, CopyIcon } from '@chakra-ui/icons';
import { useState, useEffect, useRef } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import Peer from 'simple-peer';
import io from 'socket.io-client';
import './App.css';

const socket = io.connect('http://localhost:3000');

function App() {
  const [me, setMe] = useState('');
  const [stream, setStream] = useState();
  const [receivingCall, setReceivingCall] = useState(false);
  const [caller, setCaller] = useState('');
  const [callerSignal, setCallerSignal] = useState('');
  const [callAccepted, setCallAccepted] = useState(false);
  const [idToCall, setIdToCall] = useState('');
  const [callEnded, setCallEnded] = useState(false);
  const [name, setName] = useState('');

  const myVideo = useRef();
  const userVideo = useRef();
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
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream: stream,
    });

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
    <>
      <h1 style={{ textAlign: 'center', color: '#FFF' }}>TalentPlus Video Call</h1>
      <div className="container">
        <div className="video-container">
          <div className="video">
            {stream && (
              <video playsInline muted ref={myVideo} autoPlay style={{ width: '18.75rem' }} />
            )}
          </div>

          <div className="video">
            {callAccepted && !callEnded ? (
              <video playsInline ref={userVideo} autoPlay style={{ width: '18.75rem' }} />
            ) : null}
          </div>
        </div>

        <div className="myId">
          <Input
            id="filled-basic"
            label="Name"
            variant="filled"
            value={name}
            onChange={(e) => setName(e.target.value)}
            mb={5}
          />

          <CopyToClipboard text={me} style={{ marginBottom: '2rem' }}>
            <Button variant="contained" color="primary" leftIcon={<CopyIcon fontSize="large" />}>
              Copy ID
            </Button>
          </CopyToClipboard>

          <Input
            id="filled-basic"
            label="ID to call"
            variant="filled"
            value={idToCall}
            onChange={(e) => setIdToCall(e.target.value)}
          />

          <div className="call-button">
            {callAccepted && !callEnded ? (
              <Button variant="contained" color="secondary" onClick={leaveCall}>
                End Call
              </Button>
            ) : (
              <IconButton color="primary" aria-label="call" onClick={() => callUser(idToCall)}>
                <PhoneIcon fontSize="large" />
              </IconButton>
            )}
            {idToCall}
          </div>
        </div>

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
      </div>
    </>
  );
}

export default App;
