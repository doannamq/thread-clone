import {
  Avatar,
  Box,
  Button,
  Divider,
  Flex,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import React from "react";
import { Link } from "react-router-dom";
import useFollowUnfollow from "../hooks/useFollowUnfollow";

const SearchUser = ({ user }) => {
  const { handleFollowUnfollow, following, updating } = useFollowUnfollow(user);
  return (
    <Box mb={"20px"}>
      <Flex
        alignItems={"center"}
        justifyContent={"space-between"}
        key={user.username}
      >
        <Flex
          as={Link}
          to={`/${user.username}`}
          alignItems={"center"}
          justifyContent={"space-between"}
          flex={70}
        >
          <Flex flexDirection={"column"} gap={"10px"}>
            <Flex gap={4}>
              <Avatar src={user.profilePic} />
              <Flex flexDirection={"column"}>
                <Text fontWeight={"semibold"}>{user.username}</Text>
                <Text color={useColorModeValue("gray.500", "gray.500")}>
                  {user.name}
                </Text>
              </Flex>
            </Flex>
            <Text ml={"65px"}>{user.followers.length} followers</Text>
          </Flex>
        </Flex>
        <Button
          size={"sm"}
          color={following ? "black" : "white"}
          bg={following ? "white" : "blue.400"}
          onClick={handleFollowUnfollow}
          isLoading={updating}
          _hover={{
            color: following ? "black" : "white",
            opacity: ".8",
          }}
          ml={"10px"}
        >
          {following ? "Unfollow" : "Follow"}
        </Button>
      </Flex>
      <Divider mt={"15px"} />
    </Box>
  );
};

export default SearchUser;
