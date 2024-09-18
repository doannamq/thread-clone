import React from "react";
import { useParams } from "react-router-dom";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
import { useRecoilValue } from "recoil";
import userAtom from "../../atoms/userAtom";

const RoomPage = () => {
  const { roomId } = useParams();
  const user = useRecoilValue(userAtom);

  const myMeeting = async (element) => {
    const appID = 859455248;
    const serverSecret = "8b6204b8b7be45c2a663460c88e6afdc";
    const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
      appID,
      serverSecret,
      roomId,
      Date.now().toString(),
      user.name
    );
    const zc = ZegoUIKitPrebuilt.create(kitToken);
    zc.joinRoom({
      container: element,
      sharedLinks: [
        {
          name: "Copy Link",
          url: window.location.href,
        },
      ],
      scenario: {
        mode: ZegoUIKitPrebuilt.OneONoneCall,
      },
      showScreenSharingButton: false,
    });
  };

  return (
    <div>
      <div ref={myMeeting} />
    </div>
  );
};

export default RoomPage;
