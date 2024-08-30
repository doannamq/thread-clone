import {
  Box,
  Button,
  Flex,
  Image,
  Link,
  useColorMode,
  useColorModeValue,
} from "@chakra-ui/react";
import { useRecoilValue, useSetRecoilState } from "recoil";
import userAtom from "../../atoms/userAtom";
import { AiFillHome } from "react-icons/ai";
import { RxAvatar } from "react-icons/rx";
import { Link as RouterLink } from "react-router-dom";
import { FiLogOut } from "react-icons/fi";
import useLogout from "../hooks/useLogout";
import authScreenAtom from "../../atoms/authAtom";
import { BsFillChatQuoteFill } from "react-icons/bs";
import { MdOutlineSettings } from "react-icons/md";
import { IoAddSharp, IoChatbubble, IoSearch } from "react-icons/io5";
import { FaUser } from "react-icons/fa";

const Header = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const user = useRecoilValue(userAtom);
  // const logout = useLogout();
  const setAuthScreen = useSetRecoilState(authScreenAtom);
  const bg = useColorModeValue("light", "black");
  const iconColor = colorMode === "light" ? "black" : "white";
  return (
    <Box
      position={{ base: "fixed", md: "fixed" }}
      top={{ base: "auto", md: 0 }}
      bottom={{ base: 0, md: "auto" }}
      left={{ base: 0, md: 0 }}
      width={{ base: "100%", md: "50px" }}
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
            alignItems={"center"}
            h={"40%"}
            w={"full"}
            px={{ base: "10px", md: "0px" }}
          >
            <Link as={RouterLink} to="/">
              <AiFillHome size={24} color={iconColor} />
            </Link>
            <Link as={RouterLink}>
              <IoSearch size={24} color={iconColor} />
            </Link>
            <Link as={RouterLink}>
              <IoAddSharp size={24} color={iconColor} />
            </Link>
            <Link as={RouterLink} to={`/${user.username}`}>
              <FaUser size={24} color={iconColor} />
            </Link>
            <Link as={RouterLink} to={`/chat`}>
              <IoChatbubble size={20} color={iconColor} />
            </Link>
          </Flex>
        )}
        {!user && (
          <Link
            as={RouterLink}
            to={"/auth"}
            onClick={() => setAuthScreen("login")}
          >
            Login
          </Link>
        )}

        {user && (
          <Box
            position={{ base: "fixed", md: "static" }}
            top={{ base: "0", md: "auto" }}
            right={{ base: "0", md: "auto" }}
            mt={{ base: "5px", md: "0px" }}
            mr={{ base: "5px", md: "0px" }}
          >
            <Link as={RouterLink} to={`/settings`}>
              <MdOutlineSettings size={20} />
            </Link>
          </Box>
        )}

        {!user && (
          <Link
            as={RouterLink}
            to={"/auth"}
            onClick={() => setAuthScreen("signup")}
          >
            Sign up
          </Link>
        )}
      </Flex>
    </Box>
  );
};

export default Header;
