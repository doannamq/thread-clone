import { useEffect, useState } from "react";
import UserHeader from "../components/UserHeader";
import UserPost from "../components/UserPost";
import { useParams } from "react-router-dom";
import useShowToast from "../hooks/useShowToast";

const UserPage = () => {
  const [user, setUser] = useState(null);
  const { username } = useParams();
  const showToast = useShowToast();

  useEffect(() => {
    const getUser = async () => {
      try {
        const res = await fetch(`/api/users/profile/${username}`);
        const data = await res.json();
        if (data.error) {
          showToast("Error", data.error, "error");
          return;
        }
        setUser(data);
        console.log(data);
      } catch (error) {
        showToast("Error", error, "error");
      }
    };
    getUser();
  }, [username, showToast]);

  if (!user) {
    return null;
  }

  return (
    <>
      <UserHeader user={user} />
      <UserPost
        likes={213}
        replies={58}
        postImg="/post1.png"
        postTitle="Let's talk about threads."
      />
      <UserPost
        likes={432}
        replies={481}
        postImg="/post2.png"
        postTitle="Nice tutorial."
      />
      <UserPost
        likes={2523}
        replies={1345}
        postImg="/post3.png"
        postTitle="I love this guy."
      />
      <UserPost
        likes={343}
        replies={324}
        postTitle="This is my first thread."
      />
    </>
  );
};

export default UserPage;
