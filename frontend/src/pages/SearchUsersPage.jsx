import React, { useState, useEffect } from "react";
import {
  Input,
  Spinner,
  Box,
  Text,
  List,
  ListItem,
  useColorModeValue,
  Flex,
  Avatar,
  Skeleton,
  Divider,
} from "@chakra-ui/react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import useShowToast from "../hooks/useShowToast";

const SearchUsersPage = () => {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const showToast = useShowToast();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const queryParam = searchParams.get("q");

    if (queryParam) {
      setQuery(queryParam);
      handleSearch(queryParam);
    }
  }, [location.search]);

  useEffect(() => {
    if (query) {
      handleSearch(query);
    } else {
      setUsers([]);
    }
  }, [query]);

  const handleSearch = async (searchQuery) => {
    setLoading(true);

    try {
      const res = await fetch(`/api/users/search?q=${searchQuery}`);
      const data = await res.json();
      console.log(data);
      setUsers(data);
    } catch (error) {
      showToast("Error", error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setQuery(e.target.value);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      navigate(`?q=${query}`, { replace: true });
    }
  };

  useEffect(() => {
    setLoading(true);
    const getSuggestedUsers = async () => {
      try {
        const res = await fetch("api/users/search-suggested-users");
        const data = await res.json();
        if (data.error) {
          showToast("Error", data.error, "error");
          return;
        }
        console.log(data);
        setSuggestedUsers(data);
      } catch (error) {
        showToast("Error", error.message, "error");
      } finally {
        setLoading(false);
      }
    };

    getSuggestedUsers();
  }, [showToast, setSuggestedUsers]);

  return (
    <Box p={4} maxW="600px" mx="auto" mt={"25px"}>
      <Input
        value={query}
        onChange={handleInputChange}
        onKeyPress={handleKeyPress}
        placeholder="Tìm kiếm người dùng..."
        mb={4}
        borderWidth={"1px"}
        borderStyle={"solid"}
        borderColor={useColorModeValue("gray.800", "gray.300")}
      />

      {query === "" &&
        suggestedUsers.map((suggestedUser) => (
          <Box mb={"20px"} key={suggestedUser.username}>
            <Link to={`/${suggestedUser.username}`}>
              <Flex flexDirection={"column"} gap={"10px"}>
                <Flex gap={4}>
                  <Avatar src={suggestedUser.profilePic} />
                  <Flex flexDirection={"column"}>
                    <Text fontWeight={"semibold"}>
                      {suggestedUser.username}
                    </Text>
                    <Text color={useColorModeValue("gray.500", "gray.500")}>
                      {suggestedUser.name}
                    </Text>
                  </Flex>
                </Flex>
                <Text ml={"65px"}>
                  {suggestedUser.followers.length} followers
                </Text>
              </Flex>
              <Divider mt={"15px"} />
            </Link>
          </Box>
        ))}

      {loading &&
        [0, 1, 2, 3, 4].map((_, idx) => (
          <Flex gap={"10px"} key={idx} mb={"20px"}>
            <Skeleton h={"50px"} w={"50px"} borderRadius={"full"} />
            <Flex flexDirection={"column"} gap={"10px"}>
              <Skeleton h={"20px"} w={"200px"} />
              <Skeleton h={"20px"} w={"300px"} />
            </Flex>
          </Flex>
        ))}

      <List spacing={2}>
        {!loading &&
          users.map((user) => (
            <ListItem key={user.id} mb={"20px"}>
              <Link to={`/${user.username}`}>
                <Flex flexDirection={"column"}>
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
                <Divider mt={"20px"} />
              </Link>
            </ListItem>
          ))}
      </List>
    </Box>
  );
};

export default SearchUsersPage;
