import { Avatar } from "@chakra-ui/avatar";
import { Box, Flex, Link, Text, VStack } from "@chakra-ui/layout";
import {
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Portal,
  useToast,
  Button,
  useColorModeValue,
  Modal,
  ModalOverlay,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  useDisclosure,
  ModalContent,
} from "@chakra-ui/react";
import { BsInstagram } from "react-icons/bs";
import { CgMoreO } from "react-icons/cg";
import { useRecoilValue } from "recoil";
import userAtom from "../../atoms/userAtom";
import { Link as RouterLink } from "react-router-dom";
import useFollowUnfollow from "../hooks/useFollowUnfollow";
import { useState } from "react";
import QRCode from "react-qr-code";
import Followers from "./Followers";
import Followings from "./Followings";

const UserHeader = ({ user, onTabChange }) => {
  const toast = useToast();
  const currentUser = useRecoilValue(userAtom);
  const { handleFollowUnfollow, following, updating } = useFollowUnfollow(user);
  const [activeTab, setActiveTab] = useState("threads");
  const { isOpen, onOpen, onClose } = useDisclosure();

  const currentURL = window.location.href;

  const copyURL = () => {
    const currentURL = window.location.href;
    navigator.clipboard.writeText(currentURL).then(() => {
      toast({
        title: "Notification",
        status: "success",
        description: "Profile link copied",
        duration: 3000,
        isClosable: true,
      });
    });
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    onTabChange(tab);
  };

  const bgHover = useColorModeValue("gray.300", "gray.600");

  return (
    <VStack gap={4} alignItems={"start"} mt={"30px"}>
      <Flex justifyContent={"space-between"} w={"full"}>
        <Box>
          <Text fontSize={"2xl"} fontWeight={"bold"}>
            {user.name}
          </Text>
          <Flex gap={2} alignItems={"center"}>
            <Text fontSize={"sm"}>{user.username}</Text>
            <Text
              fontSize={{
                base: "xs",
                md: "sm",
                lg: "md",
              }}
              bg={useColorModeValue("gray.300", "gray.dark")}
              color={useColorModeValue("gray.800", "gray.400")}
              p={1}
              borderRadius={"full"}
            >
              thread.net
            </Text>
          </Flex>
          <Text
            fontSize={"sm"}
            color={useColorModeValue("gray.800", "gray.400")}
            cursor={"pointer"}
            onClick={onOpen}
          >
            QR Code
          </Text>
          <Modal isOpen={isOpen} onClose={onClose} isCentered>
            <ModalOverlay />
            <ModalContent>
              <ModalHeader></ModalHeader>
              <ModalCloseButton />
              <ModalBody
                pb={6}
                display="flex"
                justifyContent="center"
                alignItems="center"
              >
                <QRCode value={currentURL} size={250} />
              </ModalBody>
            </ModalContent>
          </Modal>
        </Box>

        <Box>
          {user.profilePic && (
            <Avatar
              // name={user.name}
              src={user.profilePic}
              size={{
                base: "md",
                md: "xl",
              }}
            />
          )}

          {!user.profilePic && (
            <Avatar
              size={{
                base: "md",
                md: "xl",
              }}
            />
          )}
        </Box>
      </Flex>

      <Text>{user.bio}</Text>

      {currentUser?._id === user._id && (
        <Link as={RouterLink} to="/update">
          <Button size={"sm"} bg={useColorModeValue("gray.300", "gray.700")}>
            Update Profile
          </Button>
        </Link>
      )}
      {currentUser?._id !== user._id && (
        <Button size={"sm"} onClick={handleFollowUnfollow} isLoading={updating}>
          {following ? "Unfollow" : "Follow"}
        </Button>
      )}
      <Flex w={"full"} justifyContent={"space-between"}>
        <Flex gap={2} alignItems={"center"}>
          <Followers
            followers1={user.followers}
            userId={currentUser._id}
            user={currentUser}
          />
          <Box w={1} h={1} bg={"gray.light"} borderRadius={"full"}></Box>
          <Followings followings1={user.following} userId={currentUser._id} />
          <Box w={1} h={1} bg={"gray.light"} borderRadius={"full"}></Box>
          <Link color={"gray.light"}>instagram.com</Link>
        </Flex>
        <Flex>
          <Box className="icon-container" _hover={{ bg: bgHover }}>
            <BsInstagram size={24} cursor={"pointer"} />
          </Box>
          <Box className="icon-container" _hover={{ bg: bgHover }}>
            <Menu>
              <MenuButton>
                <CgMoreO size={24} cursor={"pointer"} />
              </MenuButton>
              <Portal>
                <MenuList bg={useColorModeValue("gray.200", "gray.dark")}>
                  <MenuItem
                    bg={useColorModeValue("gray.200", "gray.dark")}
                    onClick={copyURL}
                  >
                    Copy Link
                  </MenuItem>
                </MenuList>
              </Portal>
            </Menu>
          </Box>
        </Flex>
      </Flex>

      <Flex w={"full"}>
        <Flex
          flex={1}
          borderBottom={
            activeTab === "threads" ? "1.5px solid white" : "1px solid gray"
          }
          justifyContent={"center"}
          pb={3}
          cursor={"pointer"}
          onClick={() => handleTabChange("threads")}
        >
          <Text
            fontWeight={"bold"}
            color={activeTab === "threads" ? "white" : "gray.light"}
          >
            Threads
          </Text>
        </Flex>
        <Flex
          flex={1}
          borderBottom={
            activeTab === "reposts" ? "1.5px solid white" : "1px solid gray"
          }
          justifyContent={"center"}
          pb={3}
          cursor={"pointer"}
          onClick={() => handleTabChange("reposts")}
        >
          <Text
            fontWeight={"bold"}
            color={activeTab === "reposts" ? "white" : "gray.light"}
          >
            Reposts
          </Text>
        </Flex>
      </Flex>
    </VStack>
  );
};

export default UserHeader;
