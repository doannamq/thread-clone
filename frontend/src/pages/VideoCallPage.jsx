import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  IconButton,
  Input,
  VStack,
  Text,
} from "@chakra-ui/react";
import { CopyIcon, PhoneIcon } from "@chakra-ui/icons";
import { CopyToClipboard } from "react-copy-to-clipboard";
import Peer from "simple-peer";
import io from "socket.io-client";

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
        myVideo.current.srcObject = stream;
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
    <Container maxW="container.xl" py={8}>
      <Heading textAlign="center" mb={8} color="white">
        Zoomish
      </Heading>

      <Flex direction={{ base: "column", md: "row" }} gap={8}>
        {/* Video Container */}
        <Box flex={1}>
          <Flex direction="column" gap={4}>
            <Box
              w="full"
              h="300px"
              bg="gray.800"
              rounded="lg"
              overflow="hidden"
            >
              {stream && (
                <video
                  playsInline
                  muted
                  ref={myVideo}
                  autoPlay
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              )}
            </Box>
            <Box
              w="full"
              h="300px"
              bg="gray.800"
              rounded="lg"
              overflow="hidden"
            >
              {callAccepted && !callEnded && (
                <video
                  playsInline
                  ref={userVideo}
                  autoPlay
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              )}
            </Box>
          </Flex>
        </Box>

        {/* Controls */}
        <VStack flex={1} spacing={6} align="stretch">
          <Input
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            size="lg"
          />

          <CopyToClipboard text={me}>
            <Button
              leftIcon={<CopyIcon />}
              colorScheme="blue"
              size="lg"
              width="full"
            >
              Copy ID
            </Button>
          </CopyToClipboard>

          <Input
            placeholder="ID to call"
            value={idToCall}
            onChange={(e) => setIdToCall(e.target.value)}
            size="lg"
          />

          <Flex justify="center" align="center" gap={4}>
            {callAccepted && !callEnded ? (
              <Button colorScheme="red" onClick={leaveCall} size="lg">
                End Call
              </Button>
            ) : (
              <IconButton
                icon={<PhoneIcon />}
                colorScheme="green"
                onClick={() => callUser(idToCall)}
                size="lg"
                rounded="full"
                aria-label="Call user"
              />
            )}
          </Flex>

          {/* Incoming call alert */}
          {receivingCall && !callAccepted && (
            <VStack bg="blue.500" p={4} rounded="lg" spacing={4}>
              <Text color="white" fontSize="lg" fontWeight="bold">
                {name} is calling...
              </Text>
              <Button colorScheme="whiteAlpha" onClick={answerCall}>
                Answer
              </Button>
            </VStack>
          )}
        </VStack>
      </Flex>
    </Container>
  );
}

export default App;
