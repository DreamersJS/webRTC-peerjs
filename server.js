import Peer from "peerjs";

// On login (after you have currentUser.uid)
const peer = new Peer(currentUser.uid, {
    host: "10.159.145.243",
    port: 9000,
    path: "/",
    // for cloud later:
    // secure: true,
    // host: "your-peer-server.com",
    // port: 443,
  });
  console.log(" PeerJS server running on ws://localhost:9000");

  /**important distinction between the PeerServer and a Peer instance
   * 
This runs once on your machine (or on a server in production).

Its job is signaling: it helps peers find each other and exchange WebRTC offers/answers/ICE candidates.

You do not create a PeerServer for every user. It’s a single centralized process that all peers connect to.
   */