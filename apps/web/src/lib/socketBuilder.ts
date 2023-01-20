import { Socket, io } from "socket.io-client";

interface SocketBuilderDeps {
  url: string;
}

export class SocketBuilder {
  private url: string;
  private onUserConnect: () => void;
  private onUserDisconnect: () => void;

  constructor({ url }: SocketBuilderDeps) {
    this.url = url;

    this.onUserConnect = () => {};
    this.onUserDisconnect = () => {};
  }

  setOnUserConnect(fn: () => void) {
    this.onUserConnect = fn;
    return this;
  }
  setOnUserDisconnect(fn: () => void) {
    this.onUserDisconnect = fn;
    return this;
  }

  build() {
    const socket = io(this.url);

    socket.on("connect", this.onUserConnect);
    socket.on("disconnect", this.onUserDisconnect);

    return socket;
  }
}
