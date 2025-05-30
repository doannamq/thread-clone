import { Box, Container, Flex } from "@chakra-ui/react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import UserPage from "./pages/UserPage";
import PostPage from "./pages/PostPage";
import Header from "./components/Header";
import HomePage from "./pages/HomePage";
import AuthPage from "./pages/AuthPage";
import { useRecoilValue } from "recoil";
import userAtom from "../atoms/userAtom";
import UpdateProfilePage from "./pages/UpdateProfilePage";
import CreatePost from "./components/CreatePost";
import ChatPage from "./pages/ChatPage";
import { SettingsPage } from "./pages/SettingsPage";
import SearchUserPage from "./pages/SearchUsersPage";
import RoomPage from "./pages/RoomPage";
import VideoCallPage from "./pages/VideoCallPage";
import Notification from "./pages/Notification";

function App() {
  const user = useRecoilValue(userAtom);
  const { pathname } = useLocation();
  return (
    <Box position={"relative"} w="full">
      <Header />
      <Box
        ml={{ base: "0", md: "0px" }}
        mb={{ base: "50px", md: "0" }}
        w="full"
        pt={{ base: "0", md: 5 }}
        overflowX="hidden">
        <Container
          maxW={pathname === "/" ? { base: "620px", md: "700px" } : "620px"}>
          <Routes>
            <Route
              path="/"
              element={user ? <HomePage /> : <Navigate to={"/auth"} />}
            />

            <Route
              path="/auth"
              element={!user ? <AuthPage /> : <Navigate to={"/"} />}
            />

            <Route
              path="/update"
              element={user ? <UpdateProfilePage /> : <Navigate to={"/auth"} />}
            />
            <Route
              path="/:username"
              element={
                user ? (
                  <>
                    <UserPage />
                    <CreatePost />
                  </>
                ) : (
                  <UserPage />
                )
              }
            />
            <Route path="/:username/post/:pid" element={<PostPage />} />
            <Route
              path="/chat"
              element={user ? <ChatPage /> : <Navigate to={"/auth"} />}
            />
            <Route
              path="/settings"
              element={user ? <SettingsPage /> : <Navigate to={"/auth"} />}
            />
            <Route path="/search" element={<SearchUserPage />} />
            <Route path="/room/:roomId" element={<RoomPage />} />
            <Route path="/video" element={<VideoCallPage />} />
            <Route path="/notifications" element={<Notification />} />
          </Routes>
        </Container>
      </Box>
    </Box>
  );
}

export default App;
