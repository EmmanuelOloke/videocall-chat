import { Icon, Button, IconButton, Input } from '@chakra-ui/react';
import { PhoneIcon } from '@chakra-ui/icons';
import { AssignmentIcon } from 'react-icons/md';
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

  return (
    <div className="App">
      <h1>It all starts here</h1>
    </div>
  );
}

export default App;
