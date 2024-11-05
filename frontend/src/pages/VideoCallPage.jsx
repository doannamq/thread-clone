// import React, { useEffect, useRef, useState } from "react";
// import {
//   Button,
//   IconButton,
//   Input,
//   Box,
//   Text,
//   useToast,
//   Flex,
//   VStack,
// } from "@chakra-ui/react";
// import { PhoneIcon, CopyIcon } from "@chakra-ui/icons";
// import Peer from "simple-peer";
// import io from "socket.io-client";
// import "../App.css";
// import { useRecoilState } from "recoil";
// import userAtom from "../../atoms/userAtom";
// import { selectedConversationAtom } from "../../atoms/messagesAtom";
// import { CopyToClipboard } from "react-copy-to-clipboard";

// const socket = io.connect("http://localhost:5000");
// // const socket = io.connect("https://phuong-nam.onrender.com/");

// function VideoCallPage() {
//   const [me, setMe] = useState("");
//   const [stream, setStream] = useState();
//   const [receivingCall, setReceivingCall] = useState(false);
//   const [caller, setCaller] = useState("");
//   const [callerSignal, setCallerSignal] = useState();
//   const [callAccepted, setCallAccepted] = useState(false);
//   const [idToCall, setIdToCall] = useState("");
//   const [callEnded, setCallEnded] = useState(false);
//   const [name, setName] = useState("");
//   const myVideo = useRef();
//   const userVideo = useRef();
//   const connectionRef = useRef();
//   const toast = useToast();

//   const [user] = useRecoilState(userAtom);
//   const [selectedConversation] = useRecoilState(selectedConversationAtom);

//   useEffect(() => {
//     navigator.mediaDevices
//       .getUserMedia({ video: true, audio: true })
//       .then((stream) => {
//         setStream(stream);
//         myVideo.current.srcObject = stream;
//       });

//     socket.on("me", (id) => {
//       setMe(id);
//     });

//     socket.on("callUser", (data) => {
//       setReceivingCall(true);
//       setCaller(data.from);
//       setName(data.name);
//       setCallerSignal(data.signal);
//     });
//   }, []);

//   useEffect(() => {
//     if (stream && myVideo.current) {
//       myVideo.current.srcObject = stream;
//     }
//   }, [stream]);

//   const callUser = (id) => {
//     const peer = new Peer({
//       initiator: true,
//       trickle: false,
//       stream: stream,
//     });

//     peer.on("signal", (data) => {
//       socket.emit("callUser", {
//         userToCall: id,
//         signalData: data,
//         from: user._id,
//         name: user.username,
//       });
//     });

//     peer.on("stream", (stream) => {
//       userVideo.current.srcObject = stream;
//     });

//     socket.on("callAccepted", (signal) => {
//       setCallAccepted(true);
//       peer.signal(signal);
//     });

//     connectionRef.current = peer;
//   };

//   const answerCall = () => {
//     setCallAccepted(true);
//     const peer = new Peer({
//       initiator: false,
//       trickle: false,
//       stream: stream,
//     });

//     peer.on("signal", (data) => {
//       socket.emit("answerCall", { signal: data, to: caller });
//     });

//     peer.on("stream", (stream) => {
//       userVideo.current.srcObject = stream;
//     });

//     peer.signal(callerSignal);
//     connectionRef.current = peer;
//   };

//   const leaveCall = () => {
//     setCallEnded(true);
//     if (connectionRef.current) {
//       connectionRef.current.destroy();
//     }
//     socket.emit("endCall", {
//       userId: user._id,
//       otherId: selectedConversation.userId,
//     });
//     window.location.reload();
//   };

//   return (
//     <Box maxW="container.xl">
//       <Text textAlign="center" my={4}>
//         Zoomish
//       </Text>
//       <Flex direction={["column", "row"]} justify="space-between">
//         <Box flex={1}>
//           <VStack spacing={4} align="stretch">
//             {stream && (
//               <Box>
//                 <video playsInline muted ref={myVideo} autoPlay width="300px" />
//               </Box>
//             )}
//             {callAccepted && !callEnded && (
//               <Box>
//                 <video playsInline ref={userVideo} autoPlay width="300px" />
//               </Box>
//             )}
//           </VStack>
//         </Box>
//         <VStack flex={1} spacing={4} align="stretch">
//           <Input
//             placeholder="Name"
//             value={name}
//             onChange={(e) => setName(e.target.value)}
//           />
//           <CopyToClipboard text={me}>
//             <Button leftIcon={<CopyIcon />} colorScheme="blue">
//               Copy ID
//             </Button>
//           </CopyToClipboard>
//           <Input
//             placeholder="ID to call"
//             value={idToCall}
//             onChange={(e) => setIdToCall(e.target.value)}
//           />
//           <Flex justify="center">
//             {callAccepted && !callEnded ? (
//               <Button colorScheme="red" onClick={leaveCall}>
//                 End Call
//               </Button>
//             ) : (
//               <IconButton
//                 colorScheme="green"
//                 aria-label="Call"
//                 icon={<PhoneIcon />}
//                 onClick={() => callUser(idToCall)}
//               />
//             )}
//           </Flex>
//           {receivingCall && !callAccepted && (
//             <Box textAlign="center">
//               <Text fontSize="xl">{name} is calling...</Text>
//               <Button colorScheme="green" onClick={answerCall}>
//                 Answer
//               </Button>
//             </Box>
//           )}
//         </VStack>
//       </Flex>
//     </Box>
//   );
// }

// export default VideoCallPage;

import React, { useEffect, useRef, useState } from "react";
import { CopyToClipboard } from "react-copy-to-clipboard";
import Peer from "simple-peer";
import io from "socket.io-client";
import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  IconButton,
  Input,
  Text,
  VStack,
} from "@chakra-ui/react";
import { CopyIcon, PhoneIcon } from "@chakra-ui/icons";

const socket = io.connect("http://localhost:5000");

function App() {
  const [me, setMe] = useState("");
  const [stream, setStream] = useState();
  const [receivingCall, setReceivingCall] = useState(false);
  const [caller, setCaller] = useState("");
  const [callerSignal, setCallerSignal] = useState();
  const [callAccepted, setCallAccepted] = useState(false);
  const [idToCall, setIdToCall] = useState("");
  const [callEnded, setCallEnded] = useState(false);
  const [name, setName] = useState("");
  const myVideo = useRef();
  const userVideo = useRef();
  const connectionRef = useRef();

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        setStream(stream);
        if (myVideo.current) {
          myVideo.current.srcObject = stream;
        }
      });

    socket.on("me", (id) => {
      setMe(id);
    });

    socket.on("callUser", (data) => {
      setReceivingCall(true);
      setCaller(data.from);
      setName(data.name);
      setCallerSignal(data.signal);
    });
  }, []);

  useEffect(() => {
    if (stream && myVideo.current) {
      myVideo.current.srcObject = stream;
    }
  }, [stream]);

  const callUser = (id) => {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream: stream,
    });
    peer.on("signal", (data) => {
      socket.emit("callUser", {
        userToCall: id,
        signalData: data,
        from: me,
        name: name,
      });
    });
    peer.on("stream", (stream) => {
      userVideo.current.srcObject = stream;
    });
    socket.on("callAccepted", (signal) => {
      setCallAccepted(true);
      peer.signal(signal);
    });

    connectionRef.current = peer;
  };

  const answerCall = () => {
    setCallAccepted(true);
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream: stream,
    });
    peer.on("signal", (data) => {
      socket.emit("answerCall", { signal: data, to: caller });
    });
    peer.on("stream", (stream) => {
      userVideo.current.srcObject = stream;
    });

    peer.signal(callerSignal);
    connectionRef.current = peer;
  };

  const leaveCall = () => {
    setCallEnded(true);
    connectionRef.current.destroy();
  };

  return (
    <Container maxW="container.xl">
      <Heading textAlign="center" my={4}>
        Zoomish
      </Heading>
      <Flex direction={["column", "row"]} justify="space-between">
        <Box flex={1}>
          <VStack spacing={4} align="stretch">
            {stream && (
              <Box>
                <video playsInline muted ref={myVideo} autoPlay width="300px" />
              </Box>
            )}
            {callAccepted && !callEnded && (
              <Box>
                <video playsInline ref={userVideo} autoPlay width="300px" />
              </Box>
            )}
          </VStack>
        </Box>
        <VStack flex={1} spacing={4} align="stretch">
          <Input
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <CopyToClipboard text={me}>
            <Button leftIcon={<CopyIcon />} colorScheme="blue">
              Copy ID
            </Button>
          </CopyToClipboard>
          <Input
            placeholder="ID to call"
            value={idToCall}
            onChange={(e) => setIdToCall(e.target.value)}
          />
          <Flex justify="center">
            {callAccepted && !callEnded ? (
              <Button colorScheme="red" onClick={leaveCall}>
                End Call
              </Button>
            ) : (
              <IconButton
                colorScheme="green"
                aria-label="Call"
                icon={<PhoneIcon />}
                onClick={() => callUser(idToCall)}
              />
            )}
          </Flex>
          {receivingCall && !callAccepted && (
            <Box textAlign="center">
              <Text fontSize="xl">{name} is calling...</Text>
              <Button colorScheme="green" onClick={answerCall}>
                Answer
              </Button>
            </Box>
          )}
        </VStack>
      </Flex>
    </Container>
  );
}

export default App;
