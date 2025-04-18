import {
  Avatar,
  Box,
  Flex,
  Image,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Portal,
  Text,
  useToast,
  useColorModeValue,
} from "@chakra-ui/react";
import { BsThreeDots } from "react-icons/bs";
import { Link, useNavigate } from "react-router-dom";
import Actions from "./Actions";
import { useEffect, useState } from "react";
import useShowToast from "../hooks/useShowToast";
import { formatDistanceToNow } from "date-fns";
import { DeleteIcon } from "@chakra-ui/icons";
import { useRecoilState, useRecoilValue } from "recoil";
import userAtom from "../../atoms/userAtom";
import postsAtom from "../../atoms/postsAtom";
import useResizeImage from "../hooks/useResizeImage";
import "../../src/App.css";

const Post = ({ post, postedBy }) => {
  const [user, setUser] = useState(null);
  const showToast = useShowToast();
  const currentUser = useRecoilValue(userAtom);
  const [posts, setPosts] = useRecoilState(postsAtom);
  const { imgSize, handleImageLoad } = useResizeImage(800, 500);
  const navigate = useNavigate();

  const toast = useToast();
  const copyURL = () => {
    const currentURL = `${window.location.origin}/${user.username}/post/${post._id}`;

    navigator.clipboard.writeText(currentURL).then(() => {
      toast({
        title: "Notification",
        status: "success",
        description: "Copied",
        duration: 3000,
        isClosable: true,
      });
    });
  };

  const handleMenuClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  useEffect(() => {
    const getUser = async () => {
      try {
        const res = await fetch("/api/users/profile/" + postedBy);
        const data = await res.json();
        if (data.error) {
          showToast("Error", data.error, "error");
          return;
        }
        setUser(data);
      } catch (error) {
        showToast("Error", error.message, "error");
        setUser(null);
      }
    };
    getUser();
  }, [postedBy, showToast]);

  const handleDeletePost = async (e) => {
    try {
      e.preventDefault();
      if (!window.confirm("Are you sure you want to delete this post?")) return;

      const res = await fetch(`/api/posts/${post._id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.error) {
        showToast("Error", data.error, "error");
        return;
      }
      showToast("Success", "Post deleted", "success");
      setPosts(posts.filter((p) => p._id !== post._id));
    } catch (error) {
      showToast("Error", error.message, "error");
    }
  };

  const bgHover = useColorModeValue("gray.300", "gray.600");

  if (!user) return null;

  return (
    <Box>
      <Link to={`/${user.username}/post/${post._id}`}>
        <Flex gap={3} mb={4} py={5}>
          <Flex flexDirection={"column"} alignItems={"center"}>
            <Avatar
              size={"md"}
              name={user.name}
              src={user?.profilePic}
              onClick={(e) => {
                e.preventDefault();
                navigate(`/${user.username}`);
              }}
            />
            <Box w={"1px"} h={"full"} bg={"gray.light"} my={2}></Box>
            <Box position={"relative"} w={"full"}>
              {post.replies.length === 0 && (
                <Text textAlign={"center"}>🥱</Text>
              )}
              {post.replies[0] && (
                <Avatar
                  size="xs"
                  name={post.replies[0].name}
                  src={post.replies[0].userProfilePic}
                  position={"absolute"}
                  top={"0px"}
                  left="15px"
                  padding={"2px"}
                />
              )}

              {post.replies[1] && (
                <Avatar
                  size="xs"
                  name={post.replies[1].name}
                  src={post.replies[1].userProfilePic}
                  position={"absolute"}
                  bottom={"0px"}
                  right="-5px"
                  padding={"2px"}
                />
              )}

              {post.replies[2] && (
                <Avatar
                  size="xs"
                  name={post.replies[2].name}
                  src={post.replies[2].userProfilePic}
                  position={"absolute"}
                  bottom={"0px"}
                  left="4px"
                  padding={"2px"}
                />
              )}
            </Box>
          </Flex>
          <Flex flex={1} flexDirection={"column"} gap={2}>
            <Flex justifyContent={"space-between"} w={"full"}>
              <Flex w={"full"} alignItems={"center"}>
                <Text
                  fontSize={"sm"}
                  fontWeight={"bold"}
                  onClick={(e) => {
                    e.preventDefault();
                    navigate(`/${user.username}`);
                  }}>
                  {user?.username}
                </Text>
                <Image src="/verified.png" w={4} h={4} ml={1} />
              </Flex>
              <Flex gap={4} alignItems={"center"}>
                <Text
                  fontSize={"xs"}
                  width={36}
                  textAlign={"right"}
                  color={"gray.light"}>
                  {formatDistanceToNow(new Date(post.createdAt))} ago
                </Text>

                {currentUser?._id === user._id && (
                  <DeleteIcon size={20} onClick={handleDeletePost} />
                )}
                <Box
                  className="icon-container"
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  onClick={handleMenuClick}
                  _hover={{ bg: bgHover }}>
                  <Menu>
                    <MenuButton>
                      <BsThreeDots cursor={"pointer"} />
                    </MenuButton>
                    <Portal>
                      <MenuList bg={useColorModeValue("gray.200", "gray.dark")}>
                        <MenuItem
                          bg={useColorModeValue("gray.200", "gray.dark")}
                          onClick={copyURL}>
                          Copy Link
                        </MenuItem>
                      </MenuList>
                    </Portal>
                  </Menu>
                </Box>
              </Flex>
            </Flex>

            <Text fontSize={"sm"}>{post.text}</Text>

            {/* Hiển thị video nếu có */}
            {post.video && (
              <Box borderRadius={6} overflow="hidden" maxH="500px">
                <video
                  src={post.video}
                  controls
                  preload="metadata"
                  style={{
                    width: "100%",
                    maxHeight: "500px",
                    objectFit: "contain",
                  }}
                  onClick={(e) => e.preventDefault()}
                />
              </Box>
            )}

            {/* Hiển thị ảnh nếu có */}
            {post.img && post.img.length === 1 && (
              <Flex overflow={"hidden"} wrap="wrap" gap={2}>
                {post.img.map((imgUrl, index) => (
                  <Box key={index} overflow={"hidden"}>
                    <Image
                      src={imgUrl}
                      onLoad={handleImageLoad}
                      style={{ width: imgSize.width, height: imgSize.height }}
                      borderRadius={6}
                    />
                  </Box>
                ))}
              </Flex>
            )}

            {post.img && post.img.length > 1 && (
              <Flex
                overflowX="auto"
                wrap="nowrap"
                gap={2}
                className="custom-scrollbar">
                {post.img.map((imgUrl, index) => (
                  <Image
                    key={index}
                    src={imgUrl}
                    onLoad={handleImageLoad}
                    w={"full"}
                    style={{ width: imgSize.width, height: imgSize.height }}
                    objectFit={"cover"}
                    borderRadius={6}
                  />
                ))}
              </Flex>
            )}
            <Flex gap={3} my={1}>
              <Actions post={post} postUser={user} />
            </Flex>
          </Flex>
        </Flex>
        <Box h={"0.5px"} w={"full"} bg={"gray.light"}></Box>
      </Link>
    </Box>
  );
};

export default Post;
