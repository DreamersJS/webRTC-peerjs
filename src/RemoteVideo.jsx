import { useEffect, useRef } from "react";

export default function RemoteVideo({ remoteVideoRef }) {

  return (
    <video
      ref={remoteVideoRef}
      autoPlay
      playsInline
      className="rounded-xl shadow-md"
    />
  );
}
