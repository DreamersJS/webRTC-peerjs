import { useEffect, useRef } from "react";

export default function UserVideo({ streamRef }) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (streamRef.current && videoRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [streamRef]);

  return <video ref={videoRef} autoPlay muted playsInline className="rounded-xl shadow-md" />;
}
