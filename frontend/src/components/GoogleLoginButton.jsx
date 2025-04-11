import { Button, Icon, Link } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { FcGoogle } from "react-icons/fc";

const GoogleLoginButton = () => {
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      window.location.href = "http://localhost:5000/auth/google";
    } catch (error) {
      console.error("Lỗi khi login Google:", error);
      setLoading(false);
    }
  };

  // Thêm useEffect để kiểm tra trạng thái đăng nhập
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/users/profile", {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        });

        if (!res.ok) {
          throw new Error("Failed to fetch user profile");
        }

        const data = await res.json();

        if (data && !data.error) {
          localStorage.setItem("user-threads", JSON.stringify(data));
          window.location.href = "/"; // Chuyển hướng về trang chính
        }
      } catch (error) {
        console.error("Lỗi khi kiểm tra trạng thái đăng nhập:", error);
      } finally {
        setLoading(false);
      }
    };

    // Kiểm tra nếu URL hiện tại chứa success=true
    if (window.location.search.includes("success=true")) {
      checkAuthStatus();
    }
  }, []);

  return (
    <Button
      leftIcon={<Icon as={FcGoogle} />}
      colorScheme="gray"
      variant="outline"
      isLoading={loading}
      onClick={handleGoogleLogin}
      width="full">
      Login with Google
    </Button>
  );
};

export default GoogleLoginButton;
