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
import { useRecoilValue } from "recoil";
import userAtom from "../../atoms/userAtom";

// Thay đổi cách kết nối socket với thêm các tùy chọn
const socket = io.connect("http://localhost:5000", {
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 5,
  timeout: 10000,
});

function App() {
  const currentUser = useRecoilValue(userAtom);
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
  const [isCopied, setIsCopied] = useState(false);

  const [endCallUserName, setEndCallUserName] = useState("");
  const [showEndCallAlert, setShowEndCallAlert] = useState(false);

  const [isIdReady, setIsIdReady] = useState(false);

  // Thiết lập tên người dùng từ thông tin đăng nhập
  useEffect(() => {
    if (currentUser) {
      setName(currentUser.username || currentUser.name || "");
    }
  }, [currentUser]);

  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }

    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        setStream(stream);
        if (myVideo.current) {
          myVideo.current.srcObject = stream;
        }
      })
      .catch((err) => {
        console.error("Không thể truy cập camera hoặc microphone:", err);
      });

    socket.on("me", (id) => {
      setMe(id);
      setIsIdReady(true);
      console.log("ID của tôi:", id);
    });

    const idTimeoutCheck = setTimeout(() => {
      if (!isIdReady) {
        console.log("Không nhận được ID sau 5 giây, thử kết nối lại...");
        socket.disconnect().connect();
      }
    }, 5000);

    socket.on("callUser", (data) => {
      setReceivingCall(true);
      setCaller(data.from);
      setName(data.name);
      setCallerSignal(data.signal);
    });

    socket.on("callEnded", (data) => {
      if (callAccepted && !callEnded) {
        setEndCallUserName(data.name || "Người dùng");
        setCallEnded(true);
        setShowEndCallAlert(true);

        if (connectionRef.current) {
          connectionRef.current.destroy();
        }

        setTimeout(() => {
          setShowEndCallAlert(false);
        }, 5000);
      }
    });

    return () => {
      socket.off("me");
      socket.off("callUser");
      socket.off("callEnded");
      clearTimeout(idTimeoutCheck);
    };
  }, [callAccepted, callEnded, isIdReady]);

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

    socket.emit("endCall", {
      to: caller || idToCall,
      name: name || "Người dùng",
    });

    if (connectionRef.current) {
      connectionRef.current.destroy();
    }
  };

  const handleCopy = () => {
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <Container maxW="container.xl" py={8}>
      <Heading textAlign="center" mb={8} color="white">
        Video Call
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
              overflow="hidden">
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
              overflow="hidden">
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
          {/* Hiển thị tên người dùng thay vì input */}
          <Box p={2} bg="gray.700" rounded="md">
            <Text color="white" fontWeight="medium">
              Tên: {name}
            </Text>
          </Box>

          <CopyToClipboard text={me} onCopy={handleCopy}>
            <Button
              leftIcon={<CopyIcon />}
              colorScheme={isCopied ? "green" : isIdReady ? "blue" : "gray"}
              size="lg"
              width="full"
              isDisabled={!isIdReady}>
              {isCopied
                ? "Đã sao chép!"
                : isIdReady
                ? "Copy ID"
                : "Đang tải ID..."}
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

          {showEndCallAlert && (
            <VStack
              position="absolute"
              top="50%"
              left="50%"
              transform="translate(-50%, -50%)"
              bg="red.500"
              p={4}
              rounded="lg"
              spacing={4}
              zIndex={10}>
              <Text color="white" fontSize="lg" fontWeight="bold">
                Đã kết thúc cuộc gọi
              </Text>
              <Button
                colorScheme="whiteAlpha"
                onClick={() => setShowEndCallAlert(false)}>
                Đóng
              </Button>
            </VStack>
          )}
        </VStack>
      </Flex>
    </Container>
  );
}

export default App;
