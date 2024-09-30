import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Box, Flex, Link, Text, VStack } from "@chakra-ui/layout";
import {
  Modal,
  ModalOverlay,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  useDisclosure,
  ModalContent,
  Avatar,
} from "@chakra-ui/react";

const Followers = ({ followers1 }) => {
  const params = useParams();
  const username = params.username;
  console.log(username);
  const [followers, setFollowers] = useState([]);
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    const getFollowers = async () => {
      try {
        const res = await fetch(`/api/users/followers/${username}`);
        const data = await res.json();
        console.log(data);
        setFollowers(data);
      } catch (err) {
        console.log(err);
      }
    };
    getFollowers();
  }, []);

  return (
    <>
      <Text color={"gray.light"} cursor={"pointer"} onClick={onOpen}>
        {followers1.length} followers
      </Text>

      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Followers</ModalHeader>
          <ModalCloseButton />
          <ModalBody
            display="flex"
            maxHeight={"80vh"}
            overflowY={"scroll"}
            mb={"20px"}
          >
            <Flex flexDirection={"column"} gap={6} w={"full"}>
              {followers.map((follower) => {
                return (
                  <Flex
                    flexDirection={"row"}
                    alignItems={"center"}
                    gap={3}
                    as={Link}
                    href={`/${follower.username}`}
                    _hover={{ textDecoration: "none" }}
                  >
                    <Avatar src={follower.profilePic} />
                    <Flex flexDirection={"column"} w={"full"}>
                      <Text>{follower.username}</Text>
                      <Text>{follower.name}</Text>
                      <Box
                        h={"1px"}
                        w={"full"}
                        bg={"gray.light"}
                        mt={"10px"}
                      ></Box>
                    </Flex>
                  </Flex>
                );
              })}
              {followers.length === 0 && <Text>User has no followers</Text>}
            </Flex>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default Followers;
