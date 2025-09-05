import { useEffect, useRef } from "react";

export default function UserVideo({ videoRef, stream }) {
  useEffect(() => {
    if (stream?.current && videoRef?.current) {
      videoRef.current.srcObject = stream.current;
      console.log("🔹 Local stream attached to UserVideo", stream.current);
    }
  }, [stream, videoRef]);

  return (
    <video
      ref={videoRef}
      autoPlay
      muted
      playsInline
      className="rounded-xl shadow-md"
    />
  );
}
