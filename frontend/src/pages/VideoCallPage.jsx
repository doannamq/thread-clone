import React, { useEffect, useRef, useState } from "react";
import {
  Button,
  IconButton,
  Input,
  Box,
  Text,
  useToast,
} from "@chakra-ui/react";
import { PhoneIcon, CopyIcon } from "@chakra-ui/icons";
import Peer from "simple-peer";
import io from "socket.io-client";
import "../App.css";
import { useRecoilState } from "recoil";
import userAtom from "../../atoms/userAtom";
import { selectedConversationAtom } from "../../atoms/messagesAtom";

// const socket = io.connect("http://localhost:5000");
const socket = io.connect("https://phuong-nam.onrender.com/");

function VideoCallPage() {
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
  const toast = useToast();

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        setStream(stream);
        if (myVideo.current) {
          myVideo.current.srcObject = stream;
        }
      })
      .catch((err) => {
        console.log(err);
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
    toast({
      title: "Call Ended.",
      description: "You have ended the call.",
      status: "info",
      duration: 3000,
      isClosable: true,
    });
  };

  return (
    <Box textAlign="center" color="#fff" p={4} bg="gray.800" minHeight="100vh">
      <Text fontSize="4xl" mb={4}>
        Zoomish
      </Text>
      <Box className="container" mt={4}>
        <Box display="flex" justifyContent="center" mb={4}>
          <Box className="video" m={2}>
            {stream && (
              <video
                playsInline
                muted
                ref={myVideo}
                autoPlay
                style={{ width: "300px" }}
              />
            )}
          </Box>
          <Box className="video" m={2}>
            {callAccepted && !callEnded ? (
              <video
                playsInline
                ref={userVideo}
                autoPlay
                style={{ width: "300px" }}
              />
            ) : null}
          </Box>
        </Box>
        <Box>
          <Input
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            mb={4}
          />
          <Button
            leftIcon={<CopyIcon />}
            colorScheme="teal"
            mb={4}
            onClick={() => navigator.clipboard.writeText(me)}
          >
            Copy ID
          </Button>
          <Input
            placeholder="ID to call"
            value={idToCall}
            onChange={(e) => setIdToCall(e.target.value)}
          />
          <Box mt={4}>
            {callAccepted && !callEnded ? (
              <Button colorScheme="red" onClick={leaveCall}>
                End Call
              </Button>
            ) : (
              <IconButton
                colorScheme="teal"
                aria-label="call"
                icon={<PhoneIcon />}
                onClick={() => callUser(idToCall)}
              />
            )}
            <Text mt={2}>{idToCall}</Text>
          </Box>
        </Box>
        <Box mt={4}>
          {receivingCall && !callAccepted ? (
            <Box>
              <Text fontSize="xl" mb={4}>
                {name} is calling...
              </Text>
              <Button colorScheme="teal" onClick={answerCall}>
                Answer
              </Button>
            </Box>
          ) : null}
        </Box>
      </Box>
    </Box>
  );
}

export default VideoCallPage;
