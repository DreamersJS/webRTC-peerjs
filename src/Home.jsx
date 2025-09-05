// Home.jsx
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
  const remoteStreamRef = useRef(null);
  const userVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  // Initialize PeerJS
  useEffect(() => {
    if (!user) return;

    const p = new Peer(user.uid, {
      host: "localhost",
      port: 9000,
      path: "/",
    });

    p.on("open", (id) => {
      console.log("🔹 Connected to PeerServer with id:", id);
    });

    p.on("call", (call) => {
      console.log("🔹 Incoming call from:", call.peer);
      setIncomingCall({
        call,
        callerId: call.peer,
        callerName: call.metadata?.username || call.peer,
      });
    });

    setPeer(p);
    return () => {
      console.log("🔹 Destroying Peer instance");
      p.destroy();
    };
  }, [user]);

  // Start call (caller)
  const handleStartCall = async ({ id, username }) => {
    if (!peer) return;

    try {
      console.log("🔹 Starting call to", username, id);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      localStreamRef.current = stream;

      if (userVideoRef.current) userVideoRef.current.srcObject = stream;

      const call = peer.call(id, stream, { metadata: { username: user.username } });

      call.on("stream", (remoteStream) => {
        console.log("🔹 Remote stream received from", id, remoteStream);
        remoteStreamRef.current = remoteStream;
        if (remoteVideoRef.current) remoteVideoRef.current.srcObject = remoteStream;
        setIsCalling(false); // close caller modal
      });

      call.on("close", () => {
        console.log("🔹 Call closed by remote peer");
        handleEndCall();
      });

      call.on("error", (err) => {
        console.error("🔹 Call error:", err);
        handleEndCall();
      });

      setSelectedUser({ id, username });
      setIsCalling(true);
    } catch (err) {
      console.error("🔹 Error starting call:", err);
    }
  };

  // Accept call (callee)
  const handleAcceptCall = async () => {
    if (!incomingCall) return;

    try {
      console.log("🔹 Accepting call from", incomingCall.callerId);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      localStreamRef.current = stream;

      if (userVideoRef.current) userVideoRef.current.srcObject = stream;

      incomingCall.call.answer(stream);

      incomingCall.call.on("stream", (remoteStream) => {
        console.log("🔹 Received remote stream from caller", remoteStream);
        remoteStreamRef.current = remoteStream;
        if (remoteVideoRef.current) remoteVideoRef.current.srcObject = remoteStream;
      });

      incomingCall.call.on("close", () => {
        console.log("🔹 Caller ended the call");
        handleEndCall();
      });

      incomingCall.call.on("error", (err) => {
        console.error("🔹 Call error:", err);
        handleEndCall();
      });

      setIsCalling(true);
      setIncomingCall(null);
    } catch (err) {
      console.error("🔹 Error answering call:", err);
    }
  };

  const handleRejectCall = () => {
    console.log("🔹 Call rejected");
    setIncomingCall(null);
  };

  const handleEndCall = () => {
    console.log("🔹 Ending call");
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }
    if (remoteStreamRef.current && remoteVideoRef.current)
      remoteVideoRef.current.srcObject = null;

    setIsCalling(false);
    setSelectedUser(null);
    setIncomingCall(null);
  };

  return (
    <div className="p-4">
      <Login />
      <p>Hello {user?.username}!</p>

      <ListUsers onCall={handleStartCall} selectedUser={selectedUser} />

      {isCalling && selectedUser && (
        <ModalCallerCalling callee={selectedUser.username} onCancel={handleEndCall} />
      )}

      {incomingCall && (
        <ModalCallee
          callData={incomingCall}
          onAccept={handleAcceptCall}
          onReject={handleRejectCall}
        />
      )}

      <div className="flex gap-4 mt-4">
        <UserVideo videoRef={userVideoRef} streamRef={localStreamRef} />
        <RemoteVideo videoRef={remoteVideoRef} streamRef={remoteStreamRef} />
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
