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
import { Link, useNavigate, useParams } from "react-router-dom";
import Actions from "./Actions";
import { useEffect, useState } from "react";
import useShowToast from "../hooks/useShowToast";
import { formatDistanceToNow } from "date-fns";
import { DeleteIcon } from "@chakra-ui/icons";
import { useRecoilState, useRecoilValue } from "recoil";
import userAtom from "../../atoms/userAtom";
import postsAtom from "../../atoms/postsAtom";
import useResizeImage from "../hooks/useResizeImage";
import Post from "./Post";

const Repost = ({ repost }) => {
  const { username } = useParams();
  return (
    <Box mt={2}>
      <Flex gap={2} flexDirection={"column"}>
        <Flex alignItems={"center"} gap={2} ml={5} color={"gray"}>
          <svg
            aria-label="Repost"
            color="currentColor"
            fill="currentColor"
            height="20"
            role="img"
            viewBox="0 0 24 24"
            width="20"
          >
            <title>Repost</title>
            <path
              fill=""
              d="M19.998 9.497a1 1 0 0 0-1 1v4.228a3.274 3.274 0 0 1-3.27 3.27h-5.313l1.791-1.787a1 1 0 0 0-1.412-1.416L7.29 18.287a1.004 1.004 0 0 0-.294.707v.001c0 .023.012.042.013.065a.923.923 0 0 0 .281.643l3.502 3.504a1 1 0 0 0 1.414-1.414l-1.797-1.798h5.318a5.276 5.276 0 0 0 5.27-5.27v-4.228a1 1 0 0 0-1-1Zm-6.41-3.496-1.795 1.795a1 1 0 1 0 1.414 1.414l3.5-3.5a1.003 1.003 0 0 0 0-1.417l-3.5-3.5a1 1 0 0 0-1.414 1.414l1.794 1.794H8.27A5.277 5.277 0 0 0 3 9.271V13.5a1 1 0 0 0 2 0V9.271a3.275 3.275 0 0 1 3.271-3.27Z"
            ></path>
          </svg>
          <Text mb={1} fontSize={"sm"}>
            {username}
          </Text>
        </Flex>
        <Post
          key={repost._id}
          post={repost}
          postedBy={repost.postedBy.username}
        />
      </Flex>
    </Box>
  );
};

export default Repost;
