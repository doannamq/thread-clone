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

const Followings = ({ followings1 }) => {
  const params = useParams();
  const username = params.username;
  console.log(username);
  const [followings, setFollowings] = useState([]);
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    const getFollowings = async () => {
      try {
        const res = await fetch(`/api/users/following/${username}`);
        const data = await res.json();
        setFollowings(data);
      } catch (err) {
        console.log(err);
      }
    };
    getFollowings();
  }, []);

  console.log(followings1);

  return (
    <Box>
      <Text color={"gray.light"} cursor={"pointer"} onClick={onOpen}>
        {followings1.length} followings
      </Text>

      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Followings</ModalHeader>
          <ModalCloseButton />
          <ModalBody
            display="flex"
            maxHeight={"80vh"}
            overflowY={"scroll"}
            mb={"20px"}
          >
            <Flex flexDirection={"column"} gap={6} w={"full"}>
              {followings.map((following) => {
                return (
                  <Flex
                    flexDirection={"row"}
                    alignItems={"center"}
                    gap={3}
                    as={Link}
                    href={`/${following.username}`}
                    _hover={{ textDecoration: "none" }}
                  >
                    <Avatar src={following.profilePic} />
                    <Flex flexDirection={"column"} w={"full"}>
                      <Text>{following.username}</Text>
                      <Text>{following.name}</Text>
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
              {followings.length === 0 && <Text>User has no followings</Text>}
            </Flex>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Followings;
