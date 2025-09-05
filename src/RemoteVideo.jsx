import { useEffect, useRef } from "react";

export default function RemoteVideo() {
  const videoRef = useRef(null);

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      className="rounded-xl shadow-md"
    />
  );
}
