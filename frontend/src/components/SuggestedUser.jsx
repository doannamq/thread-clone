import {
  Avatar,
  Box,
  Button,
  Flex,
  Text,
  useColorMode,
  useColorModeValue,
} from "@chakra-ui/react";
import { Link } from "react-router-dom";
import useFollowUnfollow from "../hooks/useFollowUnfollow";

const SuggestedUser = ({ user }) => {
  const { handleFollowUnfollow, following, updating } = useFollowUnfollow(user);

  const bg = useColorModeValue("gray.300", "gray.800");

  return (
    // <Flex gap={2} justifyContent={"space-between"} alignItems={"center"}>
    <Box textAlign={"center"} bg={bg} p={4} borderRadius={"xl"} w={"135px"}>
      <Flex
        gap={2}
        as={Link}
        to={`${user.username}`}
        flexDirection={"column"}
        alignItems={"center"}
        mb={2}
      >
        <Avatar src={user.profilePic} />
        <Box>
          <Text fontSize={"sm"} fontWeight={"bold"} textAlign={"center"}>
            {user.name.length > 10
              ? user.name.substring(0, 10) + "..."
              : user.name}
          </Text>
          <Text color={"gray.light"} fontSize={"sm"} textAlign={"center"}>
            {user.username}
          </Text>
        </Box>
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
      >
        {following ? "Unfollow" : "Follow"}
      </Button>
    </Box>
    // </Flex>
  );
};

export default SuggestedUser;

//  SuggestedUser component, if u want to copy and paste as shown in the tutorial

{
  /* <Flex gap={2} justifyContent={"space-between"} alignItems={"center"}>
			<Flex gap={2} as={Link} to={`${user.username}`}>
				<Avatar src={user.profilePic} />
				<Box>
					<Text fontSize={"sm"} fontWeight={"bold"}>
						{user.username}
					</Text>
					<Text color={"gray.light"} fontSize={"sm"}>
						{user.name}
					</Text>
				</Box>
			</Flex>
			<Button
				size={"sm"}
				color={following ? "black" : "white"}
				bg={following ? "white" : "blue.400"}
				onClick={handleFollow}
				isLoading={updating}
				_hover={{
					color: following ? "black" : "white",
					opacity: ".8",
				}}
			>
				{following ? "Unfollow" : "Follow"}
			</Button>
		</Flex> */
}
