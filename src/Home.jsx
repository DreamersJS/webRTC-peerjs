import React, { useContext, useEffect, useRef, useState } from "react";
import Peer from "peerjs";
import { AppContext } from "./login/AppContext";
import UserVideo from "./UserVideo";
import RemoteVideo from "./RemoteVideo";
import ListUsers from "./ListUsers";
import ModalCallerCalling from "./ModalCallerCalling";
import ModalCallee from "./ModalCallee";
import { Login } from "./login/Login";

export default function Home() {
  const { user } = useContext(AppContext);
  const [peer, setPeer] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isCalling, setIsCalling] = useState(false);
  const [incomingCall, setIncomingCall] = useState(null);

  const localStreamRef = useRef(null);
  const remoteVideoRef = useRef(null);

  // Initialize PeerJS for this user
  useEffect(() => {
    if (!user) return;

    const p = new Peer(user.uid, {
      host: "localhost",
      port: 9000,
      path: "/"
    });

    p.on("open", id => {
      console.log("Connected to PeerServer with id:", id);
    });

    // Listen for incoming calls
    p.on("call", (call) => {
      console.log("Incoming call from:", call.peer);
      setIncomingCall({
        call,
        callerId: call.peer,
        callerName: call.metadata?.username || call.peer
      });
    });

    setPeer(p);

    return () => p.destroy();
  }, [user]);

  // Start a call
  const handleStartCall = async ({ id, username }) => {
    if (!peer) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localStreamRef.current = stream;

      const call = peer.call(id, stream, { metadata: { username: user.username } });

      call.on("stream", remoteStream => {
        if (remoteVideoRef.current) remoteVideoRef.current.srcObject = remoteStream;
      });

      setSelectedUser({ id, username });
      setIsCalling(true);
    } catch (err) {
      console.error("Error starting call:", err);
    }
  };

  // Accept incoming call
  const handleAcceptCall = async () => {
    if (!incomingCall) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localStreamRef.current = stream;

      incomingCall.call.answer(stream);

      incomingCall.call.on("stream", remoteStream => {
        if (remoteVideoRef.current) remoteVideoRef.current.srcObject = remoteStream;
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

  // End call
  const handleEndCall = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }
    setIsCalling(false);
    setSelectedUser(null);
    setIncomingCall(null);
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
  };

  return (
    <div className="p-4">
<Login />
      <p>Hello {user?.username}!</p>

      {/* User list to call */}
      <ListUsers onCall={handleStartCall} selectedUser={selectedUser} />

      {/* Caller modal */}
      {isCalling && selectedUser && (
        <ModalCallerCalling
          callee={selectedUser.username}
          onCancel={handleEndCall}
        />
      )}

      {/* Callee modal */}
      {incomingCall && (
        <ModalCallee
          callData={incomingCall}
          onAccept={handleAcceptCall}
          onReject={handleRejectCall}
        />
      )}

      {/* Video display */}
      <div className="flex gap-4 mt-4">
        <UserVideo streamRef={localStreamRef} />
        <RemoteVideo videoRef={remoteVideoRef} />
      </div>

      {isCalling && (
        <button
          className="mt-4 p-2 bg-red-500 text-white rounded"
          onClick={handleEndCall}
        >
          End Call
        </button>
      )}
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