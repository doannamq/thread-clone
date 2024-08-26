import { Box, Button, Flex, Spinner } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import useShowToast from "../hooks/useShowToast";
import Post from "../components/Post";
import { useRecoilState } from "recoil";
import postsAtom from "../../atoms/postsAtom";
import SuggestedUsers from "../components/SuggestedUsers";

const HomePage = () => {
  const [posts, setPosts] = useRecoilState(postsAtom);
  const [newFeedPosts, setNewFeedPosts] = useRecoilState(postsAtom);
  const [loading, setLoading] = useState(true);
  const showToast = useShowToast();

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const [feedResponse, newFeedResponse] = await Promise.all([
          fetch("/api/posts/feed"),
          fetch("/api/posts/newfeed"),
        ]);

        const [feedData, newFeedData] = await Promise.all([
          feedResponse.json(),
          newFeedResponse.json(),
        ]);

        if (feedData.error) {
          showToast("Error", feedData.error, "error");
        } else {
          setPosts(feedData);
        }

        if (newFeedData.error) {
          showToast("Error", newFeedData.error, "error");
        } else {
          setNewFeedPosts(newFeedData);
        }
      } catch (error) {
        showToast("Error", error.message, "error");
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [showToast, setPosts, setNewFeedPosts]);

  const newFeedPostIds = new Set(newFeedPosts.map((post) => post._id));

  const filteredPosts = posts.filter((post) => !newFeedPostIds.has(post._id));

  return (
    <Flex gap={10} alignItems={"flex-start"}>
      <Box flex={70}>
        {loading ? (
          <Flex justify={"center"}>
            <Spinner size={"xl"} />
          </Flex>
        ) : (
          <>
            {newFeedPosts.length > 0 && (
              <Box mb={8}>
                {newFeedPosts.map((newFeedPost) => (
                  <Post
                    key={newFeedPost._id}
                    post={newFeedPost}
                    postedBy={newFeedPost.postedBy}
                  />
                ))}
              </Box>
            )}

            {filteredPosts.length === 0 && (
              <h1 style={{ textAlign: "center", padding: "0px 0px 30px 0px" }}>
                Follow some users to see more feeds!
              </h1>
            )}

            {filteredPosts.length > 0 && (
              <>
                {filteredPosts.map((post) => (
                  <Post key={post._id} post={post} postedBy={post.postedBy} />
                ))}
              </>
            )}
          </>
        )}
      </Box>
      <Box
        flex={30}
        display={{
          base: "none",
          md: "block",
        }}
      >
        <SuggestedUsers />
      </Box>
    </Flex>
  );
};

export default HomePage;
