import { useEffect, useState } from "react";
import UserHeader from "../components/UserHeader";
import { useParams } from "react-router-dom";
import useShowToast from "../hooks/useShowToast";
import { Box, Flex, Skeleton, SkeletonCircle, Spinner } from "@chakra-ui/react";
import Post from "../components/Post";
import useGetUserProfile from "../hooks/useGetUserProfile";
import { useRecoilState, useRecoilValue } from "recoil";
import postsAtom from "../../atoms/postsAtom";
import Repost from "../components/Repost";
import repostsAtom from "../../atoms/repostsAtom";

const UserPage = () => {
  const { user, loading } = useGetUserProfile();
  const { username } = useParams();
  const showToast = useShowToast();
  const [posts, setPosts] = useRecoilState(postsAtom);
  const [fetchingPosts, setFetchingPosts] = useState(true);
  const [reposts, setReposts] = useRecoilState(repostsAtom);
  const [fetchingReposts, setFetchingReposts] = useState(true);
  const [activeTab, setActiveTab] = useState("threads");

  useEffect(() => {
    const getPosts = async () => {
      if (!user) return;
      setFetchingPosts(true);
      try {
        const res = await fetch(`/api/posts/user/${username}`);
        const data = await res.json();
        setPosts(data);
      } catch (error) {
        showToast("Error", error.message, "error");
        setPosts([]);
      } finally {
        setFetchingPosts(false);
      }
    };

    getPosts();
  }, [username, showToast, setPosts, user, activeTab]);

  useEffect(() => {
    const getReposts = async () => {
      if (!user || activeTab !== "reposts") return;
      setFetchingReposts(true);
      try {
        const res = await fetch(`/api/posts/user/reposts/${username}`);
        const data = await res.json();
        console.log(data);
        setReposts(data);
      } catch (error) {
        showToast("Error", error.message, "error");
        setReposts([]);
      } finally {
        setFetchingReposts(false);
      }
    };

    getReposts();
  }, [username, showToast, setReposts, user, activeTab]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  if (!user && loading) {
    return (
      <Box mt={"50px"}>
        <Flex justifyContent={"space-between"}>
          <Flex flexDirection={"column"} gap={3}>
            <Skeleton h={"35px"} w={"200px"} />
            <Flex gap={2}>
              <Skeleton h={"25px"} w={"90px"} />
              <Skeleton h={"25px"} w={"90px"} borderRadius={"full"} />
            </Flex>
          </Flex>
          <SkeletonCircle size={20} />
        </Flex>
        <Skeleton h={"28px"} w={"110px"} borderRadius={"5px"} my={10} />
        <Flex justifyContent={"space-between"}>
          <Skeleton h={"25px"} w={"250px"} />
          <Flex gap={2}>
            <SkeletonCircle />
            <SkeletonCircle />
          </Flex>
        </Flex>
      </Box>
    );
  }

  if (!user && !loading) return <h1>User not found</h1>;

  return (
    <>
      <UserHeader user={user} onTabChange={handleTabChange} />

      {activeTab === "threads" && (
        <>
          {!fetchingPosts && posts.length === 0 && (
            <h1 style={{ textAlign: "center", marginTop: "10px" }}>
              User has no posts
            </h1>
          )}

          {fetchingPosts && (
            <Flex my={12} flexDirection={"column"} gap={5}>
              {[0, 1, 2, 3, 4].map((_, idx) => (
                <Box>
                  <Flex alignItems={"center"} justifyContent={"space-between"}>
                    <Flex alignItems={"center"} gap={2}>
                      <Skeleton
                        key={idx}
                        h={12}
                        w={12}
                        borderRadius={"full"}
                        mr={2}
                      />
                      <Skeleton h={"25px"} w={"120px"} />
                    </Flex>
                    <Skeleton h={"20px"} w={"150px"} />
                  </Flex>
                  <Box height={"150px"}></Box>
                  <Skeleton h={"20px"} w={"150px"} />
                  <Skeleton h={"2px"} w={"full"} my={5} />
                </Box>
              ))}
            </Flex>
          )}

          {posts.map((post) => (
            <Post key={post._id} post={post} postedBy={post.postedBy} />
          ))}
        </>
      )}

      {activeTab === "reposts" && (
        <>
          {!fetchingReposts && reposts.length === 0 && (
            <h1 style={{ textAlign: "center", marginTop: "10px" }}>
              User has no reposts
            </h1>
          )}

          {fetchingReposts && (
            <Flex my={12} flexDirection={"column"} gap={5}>
              {[0, 1, 2, 3, 4].map((_, idx) => (
                <Box>
                  <Flex alignItems={"center"} justifyContent={"space-between"}>
                    <Flex alignItems={"center"} gap={2}>
                      <Skeleton
                        key={idx}
                        h={12}
                        w={12}
                        borderRadius={"full"}
                        mr={2}
                      />
                      <Skeleton h={"25px"} w={"120px"} />
                    </Flex>
                    <Skeleton h={"20px"} w={"150px"} />
                  </Flex>
                  <Box height={"150px"}></Box>
                  <Skeleton h={"20px"} w={"150px"} />
                  <Skeleton h={"2px"} w={"full"} my={5} />
                </Box>
              ))}
            </Flex>
          )}

          {reposts.map((repost) => (
            <Post
              key={repost._id}
              post={repost}
              postedBy={repost.postedBy.username}
            />
          ))}
        </>
      )}
    </>
  );
};

export default UserPage;
