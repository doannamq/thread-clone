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
  const [remainingChar, setRemainingChar] = useState(MAX_CHAR);
  const user = useRecoilValue(userAtom);
  const showToast = useShowToast();
  const [loading, setLoading] = useState(false);
  const [posts, setPosts] = useRecoilState(postsAtom);
  const { username } = useParams();

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

  const handleCreatePost = async () => {
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
        display={{ base: "none", md: "block" }}
      >
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
                // color={"gray.800"}
                useColorModeValue={("white", "black")}
              >
                {remainingChar}/{MAX_CHAR}
              </Text>

              <Input
                type="file"
                hidden
                ref={imageRef}
                onChange={handleImageChange}
                multiple
              />
              <Flex alignItems={"center"}>
                <BsFillImageFill
                  style={{ marginLeft: "5px", cursor: "pointer" }}
                  size={16}
                  onClick={() => imageRef.current.click()}
                />
                <Text ml={5} mb={1}>
                  {imgUrls.length} images
                </Text>
              </Flex>
            </FormControl>

            {imgUrls.length > 0 && (
              <Flex
                mt={5}
                w={"full"}
                overflowX="auto"
                wrap="nowrap"
                className="custom-scrollbar"
              >
                {imgUrls.map((url, index) => (
                  <Box
                    key={index}
                    position={"relative"}
                    mr={3}
                    minW="200px"
                    maxW="200px"
                  >
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
          </ModalBody>

          <ModalFooter>
            <Button
              colorScheme="blue"
              mr={3}
              onClick={handleCreatePost}
              isLoading={loading}
              name="postButton"
            >
              Post
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default CreatePost;
