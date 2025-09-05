import { useEffect, useRef } from "react";

export default function RemoteVideo({ remoteVideoRef }) {
  const localRef = useRef(null);

  // Optional: auto-attach ref if you want fallback
  useEffect(() => {
    if (remoteVideoRef && localRef.current) {
      remoteVideoRef.current = localRef.current;
    }
  }, [remoteVideoRef]);

  return (
    <video
      ref={remoteVideoRef}
      autoPlay
      playsInline
      className="rounded-xl shadow-md"
    />
  );
}
