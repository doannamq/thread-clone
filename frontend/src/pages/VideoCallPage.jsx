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

const socket = io.connect("http://localhost:5000");
// const socket = io.connect("https://phuong-nam.onrender.com/");

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

  const [user] = useRecoilState(userAtom);
  const [selectedConversation] = useRecoilState(selectedConversationAtom);

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        setStream(stream);
        if (myVideo.current) {
          myVideo.current.srcObject = stream;
        }
      });

    socket.on("callUser", ({ from, name: callerName, signal }) => {
      setReceivingCall(true);
      setCaller(from);
      setName(callerName);
      setCallerSignal(signal);
    });
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream: stream,
    });

    socket.on("callAccepted", (signal) => {
      setCallAccepted(true);
      peer.signal(signal);
    });

    socket.on("callEnded", () => {
      setCallEnded(true);
      if (connectionRef.current) {
        connectionRef.current.destroy();
      }
      window.location.reload();
    });

    return () => {
      socket.off("callUser");
      socket.off("callAccepted");
      socket.off("callEnded");
    };
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
        from: user._id,
        name: user.username,
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
    if (connectionRef.current) {
      connectionRef.current.destroy();
    }
    socket.emit("endCall", {
      userId: user._id,
      otherId: selectedConversation.userId,
    });
    window.location.reload();
  };

  return (
    <Box className="container">
      <Box className="video-container">
        <Box className="video">
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
        <Box className="video">
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
      <Box className="myId">
        <Text>Tên của bạn: {user.username}</Text>
        <Text>ID của bạn: {user._id}</Text>
        <Input
          placeholder="ID để gọi"
          value={idToCall}
          onChange={(e) => setIdToCall(e.target.value)}
        />
        <Box className="call-button">
          {callAccepted && !callEnded ? (
            <Button colorScheme="red" onClick={leaveCall}>
              Kết thúc cuộc gọi
            </Button>
          ) : (
            <IconButton
              colorScheme="teal"
              aria-label="Call"
              icon={<PhoneIcon />}
              onClick={() => callUser(idToCall)}
            />
          )}
        </Box>
      </Box>
      <Box>
        {receivingCall && !callAccepted ? (
          <Box className="caller">
            <Text>{name} đang gọi...</Text>
            <Button colorScheme="teal" onClick={answerCall}>
              Trả lời
            </Button>
          </Box>
        ) : null}
      </Box>
    </Box>
  );
}

export default VideoCallPage;
