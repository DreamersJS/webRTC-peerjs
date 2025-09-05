// UserVideo.jsx
import { useEffect } from "react";

export default function UserVideo({ videoRef, streamRef }) {
  useEffect(() => {
    if (streamRef?.current && videoRef?.current) {
      videoRef.current.srcObject = streamRef.current;
      console.log("🔹 Local stream attached", streamRef.current);
    }
  }, [streamRef, videoRef]);

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
