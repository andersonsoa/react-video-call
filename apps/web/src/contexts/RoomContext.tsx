import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Socket } from "socket.io-client";
import { useQuery } from "../hooks/useQuery";
import { useNavigate } from "react-router-dom";
import { SocketBuilder } from "../lib/socketBuilder";
import { PeerBuilder } from "../lib/peerBuilder";

type TMessage = {
  user: TMember;
  message: string;
};
type TMember = {
  id: string;
  name: string;
  peerId: string;
  socketId: string;
};
type TRoom = {
  id: string;
  owner: TMember;
  guest: TMember;
};
type TContext = {
  user?: TMember;
  room?: TRoom;
  roomId?: string;
  messages: TMessage[];
  myVideoRef?: React.RefObject<HTMLVideoElement>;
  otherVideoRef?: React.RefObject<HTMLVideoElement>;
  sendMessage: (message: string) => void;
};

const peerBuilder = new PeerBuilder();
const socketBuilder = new SocketBuilder({
  url: import.meta.env.VITE_WEBSOCKET_URL,
});

const RoomContext = createContext({} as TContext);

export function RoomProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();

  const userId = useQuery("userId");
  const roomId = useQuery("roomId");

  const [user, setUser] = useState<TMember | undefined>();
  const [room, setRoom] = useState<TRoom | undefined>();
  const [messages, setMessages] = useState<TMessage[]>([]);

  const socketRef = useRef<Socket>();
  const myVideoRef = useRef<HTMLVideoElement>(null);
  const otherVideoRef = useRef<HTMLVideoElement>(null);

  const streamRef = useRef<MediaStream>();

  function sendMessage(message: string) {
    if (user) {
      const tMessage: TMessage = {
        message,
        user,
      };

      socketRef.current?.emit("broadcast-message", {
        roomId,
        message,
        userId: user.id,
      });

      setMessages((c) => [...c, tMessage]);
    }
  }

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
      myVideoRef.current!.srcObject = stream;
      streamRef.current = stream;
    });

    const socket = socketBuilder
      .setOnUserConnect(async () => {
        const { peerId, peer } = await peerBuilder.build();

        peer.on("call", (call) => {
          call.answer(streamRef.current);

          call.on("stream", (guestStream) => {
            otherVideoRef.current!.srcObject = guestStream;
          });
        });

        if (roomId && userId) {
          socket.emit("join-room", {
            userId,
            roomId,
            peerId,
            socketId: socket.id,
          });
        }

        socket.on("room-updated", (data: TRoom) => {
          setRoom(data);

          if (data.owner?.id === userId) {
            setUser(data.owner);
          }

          if (data.guest?.id === userId) {
            setUser(data.guest);
            const callOwner = peer.call(data.owner.peerId, streamRef.current!);

            callOwner.on("stream", (ownerStream) => {
              otherVideoRef.current!.srcObject = ownerStream;
            });
          }
        });

        socket.on(
          "message-recived",
          (data: { message: string; user: TMember }) => {
            setMessages((c) => [...c, data]);
          },
        );
      })
      .setOnUserDisconnect(() => {
        navigate("/");
      })
      .build();

    socketRef.current = socket;
  }, [roomId, userId, navigate]);

  return (
    <RoomContext.Provider
      value={{
        user,
        room,
        roomId,
        messages,
        myVideoRef,
        otherVideoRef,
        sendMessage,
      }}
    >
      {children}
    </RoomContext.Provider>
  );
}

export function useRoom() {
  return useContext(RoomContext);
}
