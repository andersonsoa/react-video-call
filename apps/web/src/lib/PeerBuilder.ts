import Peer from "peerjs";

export class PeerBuilder {
  static build(): Promise<{ peer: Peer; peerId: string }> {
    return new Promise((resolve, reject) => {
      const peer = new Peer();

      peer.on("open", (peerId) => {
        resolve({ peer, peerId });
      });

      peer.on("error", () => {
        reject();
      });
    });
  }
}
