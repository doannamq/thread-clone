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
  Button,
} from "@chakra-ui/react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import useShowToast from "../hooks/useShowToast";
import SearchSuggestedUsers from "../components/SearchSuggestedUsers";
import SearchUser from "../components/SearchUser";

const SearchUsersPage = () => {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const showToast = useShowToast();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setQuery("");
    navigate("", { replace: true });
  }, []);

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
        id="tìm kiếm người dùng"
      />

      {query === "" &&
        suggestedUsers.map((user) => (
          <SearchSuggestedUsers key={user._id} user={user} />
        ))}

      {loading &&
        [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((_, idx) => (
          <Box mt={5}>
            <Flex alignItems={"center"} justifyContent={"space-between"}>
              <Flex gap={"10px"} key={idx} mb={"20px"}>
                <Skeleton h={"50px"} w={"50px"} borderRadius={"full"} />
                <Flex flexDirection={"column"}>
                  <Flex flexDirection={"column"} gap={"10px"}>
                    <Skeleton h={"20px"} w={"200px"} />
                    <Skeleton h={"20px"} w={"300px"} />
                  </Flex>
                  <Skeleton h={"20px"} w={"100px"} mt={5} />
                </Flex>
              </Flex>
              <Skeleton h={"30px"} w={"80px"} borderRadius={"md"} />
            </Flex>
            <Skeleton h={"1px"} w={"full"} />
          </Box>
        ))}

      {!loading && users.map((user) => <SearchUser user={user} />)}
    </Box>
  );
};

export default SearchUsersPage;
