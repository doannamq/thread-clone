import UserHeader from "../components/UserHeader";
import UserPost from "../components/UserPost";

const UserPage = () => {
  return (
    <>
      <UserHeader />
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
