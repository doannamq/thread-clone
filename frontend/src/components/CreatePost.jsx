import { AddIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  CloseButton,
  Flex,
  FormControl,
  Image,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  Textarea,
  useColorModeValue,
  useDisclosure,
} from "@chakra-ui/react";
import { useRef, useState } from "react";
import usePreviewImg from "../hooks/usePreviewImg";
import { BsFillImageFill } from "react-icons/bs";
import { RiVideoFill } from "react-icons/ri";
import { useRecoilState, useRecoilValue } from "recoil";
import userAtom from "../../atoms/userAtom";
import useShowToast from "../hooks/useShowToast";
import postsAtom from "../../atoms/postsAtom";
import { useParams } from "react-router-dom";
import "../../src/App.css";

const MAX_CHAR = 500;

const CreatePost = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [postText, setPostText] = useState("");
  const { handleImageChange, imgUrls, setImgUrls } = usePreviewImg();
  const imageRef = useRef(null);
  const videoRef = useRef(null);
  const [remainingChar, setRemainingChar] = useState(MAX_CHAR);
  const user = useRecoilValue(userAtom);
  const showToast = useShowToast();
  const [loading, setLoading] = useState(false);
  const [posts, setPosts] = useRecoilState(postsAtom);
  const { username } = useParams();
  const [videoUrl, setVideoUrl] = useState("");
  const [videoFile, setVideoFile] = useState(null);

  const handleTextChange = (e) => {
    const inputText = e.target.value;
    if (inputText.length > MAX_CHAR) {
      const truncatedText = inputText.slice(0, MAX_CHAR);
      setPostText(truncatedText);
      setRemainingChar(0);
    } else {
      setPostText(inputText);
      setRemainingChar(MAX_CHAR - inputText.length);
    }
  };

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("video/")) {
      showToast("Invalid file type", "Please select a video file", "error");
      return;
    }

    // Kiểm tra kích thước video (giới hạn 100MB)
    if (file.size > 100 * 1024 * 1024) {
      showToast("File too large", "Video must be less than 100MB", "error");
      return;
    }

    setVideoFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setVideoUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const clearVideo = () => {
    setVideoUrl("");
    setVideoFile(null);
    if (videoRef.current) {
      videoRef.current.value = "";
    }
  };

  const handleCreatePost = async () => {
    if (videoUrl && imgUrls.length > 0) {
      showToast(
        "Error",
        "You can't upload both images and video in one post",
        "error"
      );
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/posts/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          postedBy: user._id,
          text: postText,
          img: imgUrls,
          video: videoUrl,
        }),
      });

      const data = await res.json();
      if (data.error) {
        showToast("Error", data.error, "error");
        return;
      }

      showToast("Success", "Post created successfully", "success");
      if (username === user.username) {
        setPosts([data, ...posts]);
      }
      onClose();
      setPostText("");
      setImgUrls([]);
      setVideoUrl("");
      setVideoFile(null);
    } catch (error) {
      showToast("Error", error, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        position={"fixed"}
        bottom={10}
        right={5}
        bg={useColorModeValue("gray.300", "gray.dark")}
        onClick={onOpen}
        size={{ base: "sm", sm: "md" }}
        display={{ base: "none", md: "block" }}>
        <AddIcon />
      </Button>
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create Post</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl>
              <Textarea
                placeholder="What's new ?"
                onChange={handleTextChange}
                value={postText}
                name="postText"
              />
              <Text
                fontSize={"xs"}
                fontWeight={"bold"}
                textAlign={"right"}
                m={1}
                useColorModeValue={("white", "black")}>
                {remainingChar}/{MAX_CHAR}
              </Text>

              <Input
                type="file"
                hidden
                ref={imageRef}
                onChange={handleImageChange}
                multiple
                accept="image/*"
              />

              <Input
                type="file"
                hidden
                ref={videoRef}
                onChange={handleVideoChange}
                accept="video/*"
              />

              <Flex alignItems={"center"} gap={4}>
                <Flex alignItems={"center"}>
                  <BsFillImageFill
                    style={{
                      marginLeft: "5px",
                      cursor: videoUrl ? "not-allowed" : "pointer",
                    }}
                    size={16}
                    onClick={() => !videoUrl && imageRef.current.click()}
                    color={videoUrl ? "gray" : "currentColor"}
                  />
                  <Text ml={2}>{imgUrls.length} images</Text>
                </Flex>

                <Flex alignItems={"center"}>
                  <RiVideoFill
                    style={{
                      cursor: imgUrls.length > 0 ? "not-allowed" : "pointer",
                    }}
                    size={20}
                    onClick={() =>
                      imgUrls.length === 0 && videoRef.current.click()
                    }
                    color={imgUrls.length > 0 ? "gray" : "currentColor"}
                  />
                  <Text ml={2}>{videoUrl ? "1 video" : "0 video"}</Text>
                </Flex>
              </Flex>
            </FormControl>

            {imgUrls.length > 0 && (
              <Flex
                mt={5}
                w={"full"}
                overflowX="auto"
                wrap="nowrap"
                className="custom-scrollbar">
                {imgUrls.map((url, index) => (
                  <Box
                    key={index}
                    position={"relative"}
                    mr={3}
                    minW="200px"
                    maxW="200px">
                    <Image
                      src={url}
                      alt={`Selected img ${index + 1}`}
                      boxSize="200px"
                      height={"250px"}
                      objectFit="cover"
                    />
                    <CloseButton
                      onClick={() => {
                        setImgUrls(imgUrls.filter((_, i) => i !== index));
                      }}
                      bg={"gray.800"}
                      position={"absolute"}
                      top={1}
                      right={1}
                      size={"sm"}
                    />
                  </Box>
                ))}
              </Flex>
            )}

            {videoUrl && (
              <Box position="relative" mt={5}>
                <video
                  src={videoUrl}
                  controls
                  width="100%"
                  height="auto"
                  style={{ maxHeight: "300px" }}
                />
                <CloseButton
                  onClick={clearVideo}
                  bg={"gray.800"}
                  position={"absolute"}
                  top={1}
                  right={1}
                  size={"sm"}
                />
              </Box>
            )}
          </ModalBody>

          <ModalFooter>
            <Button
              colorScheme="blue"
              mr={3}
              onClick={handleCreatePost}
              isLoading={loading}
              name="postButton">
              Post
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default CreatePost;
