// RemoteVideo.jsx
import { useEffect } from "react";

export default function RemoteVideo({ videoRef, streamRef }) {
  useEffect(() => {
    if (streamRef?.current && videoRef?.current) {
      videoRef.current.srcObject = streamRef.current;
      console.log("🔹 Remote stream attached", streamRef.current);
    }
  }, [streamRef, videoRef]);

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      className="rounded-xl shadow-md"
    />
  );
}
