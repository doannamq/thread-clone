import { Box, Flex, Skeleton, Text } from "@chakra-ui/react";
import { useCallback, useEffect, useRef, useState } from "react";
import Post from "../components/Post";
import SuggestedUsers from "../components/SuggestedUsers";
import { useRecoilState } from "recoil";
import postsAtom from "../../atoms/postsAtom";

const HomePage = () => {
  const [posts, setPosts] = useRecoilState(postsAtom);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const fetchPosts = async (page, limit) => {
    const res = await fetch(`/api/posts/feed?page=${page}&limit=${limit}`);
    const data = await res.json();
    return data;
  };

  const loadMorePosts = async () => {
    setLoading(true);
    const newPosts = await fetchPosts(page, 3);

    setPosts((prevPosts) => [...prevPosts, ...newPosts]);

    if (newPosts.length < 3) {
      setHasMore(false);
    }

    setLoading(false);
  };

  useEffect(() => {
    if (hasMore) {
      loadMorePosts();
    }
  }, [page]);

  const observer = useRef();

  const lastPostElementRef = useCallback(
    (node) => {
      if (loading || !hasMore) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          setPage((prevPage) => prevPage + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, hasMore]
  );

  useEffect(() => {
    setPosts([]);
    setPage(1);
    setHasMore(true);
  }, []);

  return (
    <>
      <Flex gap="10" alignItems={"flex-start"} mt={"20px"}>
        <Box>
          {posts.map((post, index) => (
            <Box
              key={post._id}
              ref={posts.length === index + 1 ? lastPostElementRef : null}
            >
              <Post key={post._id} post={post} postedBy={post.postedBy} />
            </Box>
          ))}

          {loading &&
            [0, 1, 2].map((_, idx) => (
              <Flex flexDir={"column"} gap={2} key={idx} mt={"5px"}>
                <Flex alignItems={"center"}>
                  <Skeleton h={12} w={12} borderRadius={"full"} mr={2} />
                  <Skeleton h={8} w={{ base: "25%", md: "200px" }} />
                </Flex>
                <Skeleton
                  h={8}
                  w={{ base: "50%", md: "250px" }}
                  ml={14}
                  mb={2}
                />
                <Skeleton
                  h={{ base: 40, md: 60 }}
                  w={{ base: "250px", md: "500px" }}
                  ml={14}
                  mb={2}
                />
              </Flex>
            ))}

          {posts.length === 0 && !loading && (
            <Text>Follow some users to see their posts</Text>
          )}

          {!hasMore && (
            <Text my={4} textAlign="center">
              Follow more users to see more posts
            </Text>
          )}
        </Box>
      </Flex>
      <SuggestedUsers />
    </>
  );
};

export default HomePage;
