import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "./login/AppContext";
import UserVideo from "./UserVideo";
import RemoteVideo from "./RemoteVideo";
import ListUsers from "./ListUsers";
import ModalCallerCalling from "./ModalCallerCalling";
import ModalCallee from "./ModalCallee";
import { Login } from "./login/Login";
import Peer from "peerjs";

// login and store userData in context
// Hello {user.username}
// list of users + button to select user to call
// on click of button, start call with that user, popup modal Calling Marty... Cancel call button
// other user gets popup modal Incoming call from Andy Accept/Reject buttons
// on accept, join call- both users see video call screen
export default function Home() {
  const { user } = useContext(AppContext);
  // caller is calling selected user
  const [isCalling, setIsCalling] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  // callee has incoming call from caller
  const [incomingCall, setIncomingCall] = useState(null); // { callId, callerId, callerName }
  // Add activeCall state to track if user is already in a call. Reject new calls automatically or queue them.

  // Peer instance & connect to the PeerServer
  const [peer, setPeer] = useState(null);
  const localStreamRef = useRef(null);
  const remoteVideoRef = useRef(null);

  useEffect(() => {
    if (!user) return;

    peer = new Peer(user.uid, {
      host: "localhost",
      port: 9000,
      path: "/",
    });

    peer.on("open", id => {
      console.log("Connected to PeerServer with id:", id);
    });

    setPeer(peer);

    return () => peer.destroy();
  }, [user]);


  // useEffect(() => {
  // if (user) {
  //   console.log({user});
  // }
  // }, [user]);


  const handleStartCall = async ({ id, username }) => {
    if (!peer) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localStreamRef.current = stream;

      const call = peer.call(id, stream, { metadata: { username: user.username } });

      call.on("stream", remoteStream => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStream;
        }
      });

      setSelectedUser({ id, username });
      setIsCalling(true);
    } catch (err) {
      console.error("Error starting call:", err);
    }
  };

  const handleAcceptCall = async () => {
    if (!incomingCall) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localStreamRef.current = stream;

      incomingCall.call.answer(stream);

      incomingCall.call.on("stream", remoteStream => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStream;
        }
      });

      setIsCalling(true);
      setIncomingCall(null);
    } catch (err) {
      console.error("Error answering call:", err);
    }
  };

  const handleRejectCall = () => {
    setIncomingCall(null);
  };


  const handleJoinCall = async () => {

  }

  const handleEndCall = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }
    setIsCalling(false);
    setSelectedUser(null);
    setIncomingCall(null);
  };


  return (
    <div >
      <Login />
      <p>Hello {user?.username}!</p>

      <ListUsers
        onCall={handleStartCall}
        selectedUser={selectedUser}
      />

      {isCalling && selectedUser &&
        <ModalCallerCalling
          callee={selectedUser.username}
          onCancel={handleEndCall} />}

      {incomingCall && <ModalCallee
         callData={incomingCall}
         onAccept={handleAcceptCall}
         onReject={handleRejectCall}
      />}

      <div className="flex gap-4">
        <UserVideo streamRef={localStreamRef} />
        <RemoteVideo videoRef={remoteVideoRef} />
        {isCalling && <button onClick={handleEndCall}>End call</button>}
      </div>
    </div>
  );
}

/**Peer instance in any React component
 * 
Each React user (client) creates their own Peer instance.

This Peer instance represents that single user in the WebRTC network.

It connects to the single PeerServer (localhost:9000).

So if 3 users are online:

1 PeerServer running on port 9000
3 separate Peer instances (one per logged-in user) connecting to the server
 */