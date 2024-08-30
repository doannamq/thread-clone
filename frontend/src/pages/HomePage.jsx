import { Box, Flex, Skeleton, Spinner } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import useShowToast from "../hooks/useShowToast";
import Post from "../components/Post";
import { useRecoilState } from "recoil";
import postsAtom from "../../atoms/postsAtom";
import SuggestedUsers from "../components/SuggestedUsers";

const HomePage = () => {
  const [posts, setPosts] = useRecoilState(postsAtom);
  const [loading, setLoading] = useState(true);
  const showToast = useShowToast();

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        // Gửi cả hai yêu cầu API song song
        const [feedResponse, newFeedResponse] = await Promise.all([
          fetch("/api/posts/feed"),
          fetch("/api/posts/newfeed"),
        ]);

        const feedData = await feedResponse.json();
        const newFeedData = await newFeedResponse.json();

        if (feedData.error) {
          showToast("Error", feedData.error, "error");
          return;
        }

        if (newFeedData.error) {
          showToast("Error", newFeedData.error, "error");
          return;
        }

        console.log("Feed Posts", feedData);
        console.log("New Feed Posts", newFeedData);

        const existingPostIds = new Set(feedData.map((post) => post.id));

        const filteredNewFeedData = newFeedData.filter(
          (post) => !existingPostIds.has(post.id)
        );

        setPosts([...feedData, ...filteredNewFeedData]);
      } catch (error) {
        showToast("Error", error.message, "error");
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [showToast, setPosts]);

  return (
    <Flex gap="10" alignItems={"flex-start"}>
      <Box>
        {loading &&
          [0, 1, 2, 3, 4].map((_, idx) => (
            <Flex flexDir={"column"} gap={2} key={idx}>
              <Flex alignItems={"center"}>
                <Skeleton h={12} w={12} borderRadius={"full"} mr={2} />
                <Skeleton h={8} w={"30%"} />
              </Flex>
              <Skeleton h={8} w={"50%"} ml={14} mb={2} />
              <Skeleton h={60} w={"70%"} ml={14} mb={2} />
            </Flex>
          ))}

        {posts.slice(0, 7).map((post) => (
          <Post key={post._id} post={post} postedBy={post.postedBy} />
        ))}

        <Box
          display={{
            base: "none",
            md: "block",
          }}
        >
          <SuggestedUsers />
        </Box>

        {posts.slice(7).map((post) => (
          <Post key={post._id} post={post} postedBy={post.postedBy} />
        ))}
      </Box>
      {/* <Box
        display={{
          base: "none",
          md: "block",
        }}
      >
        <SuggestedUsers />
      </Box> */}
    </Flex>
  );
};

export default HomePage;
