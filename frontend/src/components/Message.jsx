import { Avatar, Box, Flex, Text, Image, Skeleton } from "@chakra-ui/react";
import { useRecoilValue } from "recoil";
import { selectedConversationAtom } from "../../atoms/messagesAtom";
import userAtom from "../../atoms/userAtom";
import { BsCheck2All } from "react-icons/bs";
import { useState } from "react";

const Message = ({ ownMessage, message }) => {
  const selectedConversation = useRecoilValue(selectedConversationAtom);
  const user = useRecoilValue(userAtom);
  const [imgLoaded, setImgLoaded] = useState(false);

  return (
    <>
      {ownMessage ? (
        <Flex gap={2} alignSelf={"flex-end"}>
          {message.text && (
            <Flex bg={"green.800"} maxW={"350px"} p={1} borderRadius={"md"}>
              <Text color={"white"}>{message.text}</Text>
              <Box
                alignSelf={"flex-end"}
                ml={1}
                color={message.seen ? "blue.400" : ""}
                fontWeight={"bold"}
              >
                <BsCheck2All size={16} />
              </Box>
            </Flex>
          )}

          {message.imgs.length > 0 && (
            <Flex mt={5} flexWrap="wrap" gap={2}>
              {message.imgs.map((imgUrl, index) => (
                <Box key={index} w={"200px"}>
                  <Image
                    src={imgUrl}
                    alt={`Message image ${index + 1}`}
                    borderRadius={4}
                    onLoad={() => setImgLoaded(true)}
                    hidden={!imgLoaded}
                  />
                  {!imgLoaded && <Skeleton w={"200px"} h={"200px"} />}
                  <Box
                    alignSelf={"flex-end"}
                    ml={1}
                    color={message.seen ? "blue.400" : ""}
                    fontWeight={"bold"}
                  >
                    <BsCheck2All size={16} />
                  </Box>
                </Box>
              ))}
            </Flex>
          )}
          <Avatar src={user.profilePic} w={7} h={7} />
        </Flex>
      ) : (
        <Flex gap={2}>
          <Avatar src={selectedConversation.userProfilePic} w={7} h={7} />

          {message.text && (
            <Text
              maxW={"350px"}
              bg={"gray.400"}
              p={1}
              borderRadius={"md"}
              color={"black"}
            >
              {message.text}
            </Text>
          )}

          {message.imgs.length > 0 && (
            <Flex mt={5} flexWrap="wrap" gap={2}>
              {message.imgs.map((imgUrl, index) => (
                <Box key={index} w={"200px"}>
                  <Image
                    src={imgUrl}
                    alt={`Message image ${index + 1}`}
                    borderRadius={4}
                    onLoad={() => setImgLoaded(true)}
                    hidden={!imgLoaded}
                  />
                  {!imgLoaded && <Skeleton w={"200px"} h={"200px"} />}
                </Box>
              ))}
            </Flex>
          )}
        </Flex>
      )}
    </>
  );
};

export default Message;
