import {
  SkipBack,
  MicrophoneSlash,
  CameraSlash,
  ChatCentered,
  CopySimple,
  DotsThree,
} from "phosphor-react";
import { Chat } from "../components/Chat";
import { useRoom } from "../contexts/RoomContext";
import { nanoid } from "nanoid";
import { useMemo, useRef, useState } from "react";
import { CanvasDrawer } from "../lib/util/utilities";
import { PoseDetection } from "../lib/PoseDetection";

const baseURL =
  process.env.VERCEL_URL ||
  process.env.VITE_VERCEL_URL ||
  "http://localhost:3000";

export function Room() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [copied, setCopied] = useState(false);
  const { roomId, room, user, myVideoRef, otherVideoRef } = useRoom();

  const guestId = useMemo(() => nanoid(), []);

  async function handleCopyToClipboard() {
    navigator.clipboard
      .writeText(`${baseURL}/room?userId=${guestId}&roomId=${roomId}`)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1000);
      });
  }

  async function rumPredictions() {
    const size = {
      width: 640,
      height: 480,
    };

    if (
      otherVideoRef.current &&
      canvasRef.current &&
      room?.owner.id === user?.id
    ) {
      const drawer = new CanvasDrawer({
        canvas: canvasRef.current,
        size,
        scoreThreshold: 0.3,
      });
      const predictor = new PoseDetection({
        drawer,
        video: otherVideoRef.current,
      });

      predictor.start();
    }
  }

  rumPredictions();

  return (
    <section className="flex w-full h-screen p-4 gap-6">
      <div className="flex-1 flex flex-col">
        <header className="flex justify-between items-center h-[10vh]">
          <div>
            {user?.id === room?.owner.id ? (
              <button
                className={`text-sm relative border border-zinc-600 px-2 py-1 rounded flex items-center gap-2 transition-all overflow-hidden`}
                onClick={handleCopyToClipboard}
              >
                {copied ? (
                  <div className="bg-green-300 text-zinc-600 absolute inset-0 grid place-items-center font-bold">
                    url copiada para o clipboard...
                  </div>
                ) : null}
                <>
                  <pre>
                    <code>{`${baseURL}/room?userId=${guestId}&roomId=${roomId}`}</code>
                  </pre>
                  <CopySimple />
                </>
              </button>
            ) : null}
          </div>

          <div>
            <button className="flex gap-2 items-center px-6 py-3 bg-zinc-600 rounded shadow font-semibold">
              <SkipBack />
              Sair
            </button>
          </div>
        </header>

        <main className="flex-1 flex h-[80vh]">
          <div className="flex-grow flex flex-col gap-4 justify-center items-center">
            <div className="ring-2 relative">
              <video
                autoPlay
                loop
                className="m-0"
                ref={otherVideoRef}
                style={{ width: 640, height: 480 }}
              />
              <canvas
                className="absolute inset-0"
                style={{ width: 640, height: 480 }}
                ref={canvasRef}
              />

              <div className="absolute bottom-0 right-0 px-2 text-sm bg-zinc-900/75">
                username
              </div>
            </div>

            <div className="w-80 h-52 ring-2 relative">
              <video
                autoPlay
                loop
                className="w-full h-full m-0"
                ref={myVideoRef}
              />
              <div className="absolute bottom-0 right-0 px-2 text-sm bg-zinc-900/75">
                username
              </div>
            </div>
          </div>
        </main>

        <footer className="flex items-center justify-between py-4 h-[10vh]">
          <div>
            <button className="w-14 h-14 rounded-full grid place-items-center text-xl bg-zinc-600 shadow-md hover:bg-zinc-700 transition-all">
              <DotsThree />
            </button>
          </div>

          <div className="flex gap-4">
            <button className="w-14 h-14 rounded-full grid place-items-center text-xl bg-zinc-600 shadow-md hover:bg-zinc-700 transition-all">
              <CameraSlash />
            </button>

            <button className="w-14 h-14 rounded-full grid place-items-center text-xl bg-zinc-600 shadow-md hover:bg-zinc-700 transition-all">
              <MicrophoneSlash />
            </button>
          </div>

          <div>
            <button className="w-14 h-14 rounded-full grid place-items-center text-xl bg-zinc-600 shadow-md hover:bg-zinc-700 transition-all">
              <ChatCentered />
            </button>
          </div>
        </footer>
      </div>
      <aside className="w-96">
        <Chat />
      </aside>
    </section>
  );
}
