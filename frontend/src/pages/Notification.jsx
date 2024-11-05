import React, { useState, useEffect } from "react";
import { useRecoilValue } from "recoil";
import userAtom from "../../atoms/userAtom";
import {
  Avatar,
  Box,
  Flex,
  Image,
  Skeleton,
  Stack,
  Text,
} from "@chakra-ui/react";
import { Link } from "react-router-dom";

const Notification = () => {
  const [notifications, setNotifications] = useState([]);
  const user = useRecoilValue(userAtom);
  const [loading, setLoading] = useState(false);
  console.log(user._id);

  useEffect(() => {
    const getNotifications = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/notifications/${user._id}`);
        const data = await res.json();
        console.log(data);
        setNotifications(data);
      } catch (error) {
        console.error("Error fetching notifications", error);
      } finally {
        setLoading(false);
      }
    };

    if (user._id) {
      getNotifications();
    }
  }, [user._id]);
  return (
    <Stack>
      <Text fontSize={"2xl"} fontWeight={"bold"} my={"20px"}>
        Notifications
      </Text>
      <Box>
        {loading &&
          [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((_, idx) => (
            <Box mt={5}>
              <Flex alignItems={"center"} justifyContent={"space-between"}>
                <Flex gap={"10px"} key={idx} mb={"20px"} alignItems={"center"}>
                  <Skeleton h={"70px"} w={"70px"} borderRadius={"full"} />
                  <Flex flexDirection={"column"}>
                    <Skeleton h={"20px"} w={"300px"} />
                  </Flex>
                </Flex>
              </Flex>
            </Box>
          ))}
        {!loading &&
          notifications.map((notification) => {
            return (
              <Link
                to={
                  notification.type !== "follow"
                    ? `/${user.username}/post/${notification.postId}`
                    : `/${notification.senderId.username}`
                }
              >
                <Flex alignItems={"center"} mb={10}>
                  <Avatar
                    size={"lg"}
                    boxShadow={"md"}
                    src={notification.senderId.profilePic}
                  />
                  <Box>
                    <Text fontSize={"lg"} ml={2}>
                      {notification.senderId.username} has{" "}
                      {(() => {
                        if (notification.type === "like") {
                          return " liked your post";
                        } else if (notification.type === "comment") {
                          return " commented on your post";
                        } else if (notification.type === "follow") {
                          return " followed you";
                        } else {
                          return " interacted with your post";
                        }
                      })()}
                    </Text>
                  </Box>
                </Flex>
              </Link>
            );
          })}
      </Box>
    </Stack>
  );
};

export default Notification;
