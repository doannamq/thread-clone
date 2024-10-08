import {
  Avatar,
  Box,
  Button,
  Divider,
  Flex,
  Skeleton,
  Text,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import SuggestedUser from "./SuggestedUser";
import useShowToast from "../hooks/useShowToast";

const SuggestedUsers = () => {
  const [loading, setLoading] = useState(true);
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const showToast = useShowToast();
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const getSuggestedUsers = async () => {
      setLoading(true);
      try {
        const res = await fetch("api/users/suggested");
        const data = await res.json();
        if (data.error) {
          showToast("Error", data.error, "error");
          return;
        }

        setSuggestedUsers(data);
      } catch (error) {
        showToast("Error", error.message, "error");
      } finally {
        setLoading(false);
      }
    };

    getSuggestedUsers();
  }, [showToast]);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  let display = windowWidth > 1350 ? "block" : "none";

  return (
    <Box position={"absolute"} top={10} right={20} display={display}>
      <Text mb={4} fontWeight={"bold"}>
        Suggested Users
      </Text>
      <Flex gap={4} flexDirection={"column"}>
        {!loading &&
          suggestedUsers.map((user) => (
            <SuggestedUser key={user._id} user={user} />
          ))}

        {loading &&
          [0, 1, 2, 3, 4].map((_, idx) => (
            <Flex
              key={idx}
              gap={2}
              alignItems={"center"}
              p={1}
              borderRadius={"md"}
            >
              <Box>
                <Skeleton size={"10"} />
              </Box>

              <Flex w={"full"} flexDirection={"column"} gap={2}>
                <Skeleton h={"8px"} w={"120px"} />
                <Skeleton h={"8px"} w={"150px"} />
              </Flex>

              <Flex>
                <Skeleton h={"20px"} w={"60px"} />
              </Flex>
            </Flex>
          ))}
      </Flex>
    </Box>
  );
};

export default SuggestedUsers;

{
  /* <Flex
key={idx}
gap={2}
alignItems={"center"}
p={1}
borderRadius={"md"}
>
<Box>
  <Skeleton size={"10"} />
</Box>

<Flex w={"full"} flexDirection={"column"} gap={2}>
  <Skeleton h={"8px"} w={"80px"} />
  <Skeleton h={"8px"} w={"90px"} />
</Flex>

<Flex>
  <Skeleton h={"20px"} w={"60px"} />
</Flex>
</Flex> */
}
