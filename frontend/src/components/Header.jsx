import {
  Box,
  Button,
  CloseButton,
  Flex,
  FormControl,
  Image,
  Input,
  Link,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  Textarea,
  useColorMode,
  useColorModeValue,
  useDisclosure,
} from "@chakra-ui/react";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import userAtom from "../../atoms/userAtom";
import { AiFillHome } from "react-icons/ai";
import { RxAvatar } from "react-icons/rx";
import { Link as RouterLink, useParams } from "react-router-dom";
import { FiLogOut } from "react-icons/fi";
import useLogout from "../hooks/useLogout";
import authScreenAtom from "../../atoms/authAtom";
import { BsFillChatQuoteFill, BsFillImageFill } from "react-icons/bs";
import { MdOutlineSettings } from "react-icons/md";
import { IoAddSharp, IoChatbubble, IoSearch } from "react-icons/io5";
import { FaBell } from "react-icons/fa";
import { FaUser } from "react-icons/fa";
import { useRef, useState } from "react";
import usePreviewImg from "../hooks/usePreviewImg";
import useShowToast from "../hooks/useShowToast";
import postsAtom from "../../atoms/postsAtom";

const MAX_CHAR = 500;

const Header = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const user = useRecoilValue(userAtom);

  const setAuthScreen = useSetRecoilState(authScreenAtom);
  const bg = useColorModeValue("light", "black");
  const iconColor = colorMode === "light" ? "black" : "white";
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [postText, setPostText] = useState("");
  const { handleImageChange, imgUrls, setImgUrls } = usePreviewImg();
  const imageRef = useRef(null);
  const [remainingChar, setRemainingChar] = useState(MAX_CHAR);
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

      setPosts((prevPosts) => [data, ...prevPosts]);

      onClose();
      setPostText("");
      setImgUrls([]);
      setRemainingChar(MAX_CHAR);
    } catch (error) {
      showToast("Error", error, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      position={{ base: "fixed", md: "fixed" }}
      top={{ base: "auto", md: 0 }}
      bottom={{ base: 0, md: "auto" }}
      left={{ base: 0, md: 0 }}
      width={{ base: "100%", md: "50px", lg: "150px" }}
      height={{ base: "50px", md: "100vh" }}
      bg={bg}
      color="white"
      zIndex="1000"
    >
      <Flex
        justifyContent={"space-between"}
        flexDirection={{ base: "row", md: "column" }}
        alignItems={"center"}
        h={"full"}
        pt={5}
        pb={10}
      >
        <Image
          cursor={"pointer"}
          alt="logo"
          w={5}
          src={colorMode === "dark" ? "/light-logo.svg" : "/dark-logo.svg"}
          onClick={toggleColorMode}
          position={{ base: "fixed", md: "static" }}
          top={{ base: 0, md: "auto" }}
          right={{ base: "50%", md: "auto" }}
          left={{ base: "50%", md: "auto" }}
          mt={{ base: "5px", md: "0px" }}
        />

        {user && (
          <Flex
            flexDirection={{ base: "row", md: "column" }}
            justifyContent={"space-between"}
            h={"40%"}
            w={"full"}
            alignItems={"center"}
            px={{ base: "10px", md: "10px" }}
          >
            <Box as={RouterLink} to="/">
              <Flex gap={2} alignItems={"center"}>
                <AiFillHome size={24} color={iconColor} />
                <Text
                  display={{ base: "none", md: "none", lg: "block" }}
                  color={iconColor}
                >
                  Home
                </Text>
              </Flex>
            </Box>
            <Box as={RouterLink} to="/search">
              <Flex gap={2} alignItems={"center"}>
                <IoSearch size={24} color={iconColor} />
                <Text
                  display={{ base: "none", md: "none", lg: "block" }}
                  color={iconColor}
                >
                  Search
                </Text>
              </Flex>
            </Box>
            <Flex
              gap={{ base: 0, md: 2 }}
              alignItems={"center"}
              onClick={onOpen}
              cursor={"pointer"}
              id="createPost"
            >
              <Box
                as={RouterLink}
                bg={useColorModeValue("gray.300", "gray.500")}
                px={2}
                py={1}
                borderRadius={"md"}
              >
                <IoAddSharp size={24} color={iconColor} id="createPost" />
              </Box>
              <Text
                display={{ base: "none", md: "none", lg: "block" }}
                color={iconColor}
              >
                Create
              </Text>
            </Flex>
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
                      id="postText"
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
                    <BsFillImageFill
                      style={{ marginLeft: "5px", cursor: "pointer" }}
                      size={16}
                      onClick={() => imageRef.current.click()}
                    />
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
                    id="postButton"
                  >
                    Post
                  </Button>
                </ModalFooter>
              </ModalContent>
            </Modal>
            <Box as={RouterLink} to={`/chat`}>
              <Flex gap={2} alignItems={"center"}>
                <IoChatbubble size={20} color={iconColor} id="message" />
                <Text
                  display={{ base: "none", md: "none", lg: "block" }}
                  color={iconColor}
                >
                  Message
                </Text>
              </Flex>
            </Box>
            <Box as={RouterLink} to={`/${user.username}`}>
              <Flex gap={2} alignItems={"center"}>
                <FaUser size={24} color={iconColor} />
                <Text
                  display={{ base: "none", md: "none", lg: "block" }}
                  color={iconColor}
                >
                  Profile
                </Text>
              </Flex>
            </Box>
          </Flex>
        )}

        {user && (
          <Box
            position={{ base: "fixed", md: "static" }}
            top={{ base: "0", md: "auto" }}
            right={{ base: "0", md: "auto" }}
            mt={{ base: "5px", md: "0px" }}
            mr={{ base: "5px", md: "0px" }}
            display={{ base: "flex", md: "block", lg: "block" }}
          >
            <Box as={RouterLink} to={`/notifications`}>
              <Flex alignItems={"center"} gap={2}>
                <FaBell size={18} color={iconColor} />
                <Text
                  display={{ base: "none", md: "none", lg: "block" }}
                  color={iconColor}
                >
                  Notification
                </Text>
              </Flex>
            </Box>
            <Box as={RouterLink} to={`/settings`}>
              <Flex alignItems={"center"} gap={2}>
                <MdOutlineSettings size={20} color={iconColor} />
                <Text
                  display={{ base: "none", md: "none", lg: "block" }}
                  color={iconColor}
                >
                  Setting
                </Text>
              </Flex>
            </Box>
          </Box>
        )}
      </Flex>
    </Box>
  );
};

export default Header;
