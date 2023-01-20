import React, { useState } from "react";
import { Message } from "./Message";
import { useRoom } from "../contexts/RoomContext";

export function Chat() {
  const { messages, sendMessage } = useRoom();

  const [message, setMessage] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    sendMessage(message);
    setMessage("");
  }

  return (
    <div className="flex flex-col justify-end h-full bg-zinc-200 px-1 py-5 rounded-md shadow-md text-zinc-800">
      <div className="flex-grow justify-end overflow-y-scroll border-b-2 border-b-zinc-300 pb-3 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-zinc-400 px-4">
        <div className="grid gap-3">
          {messages.length ? (
            messages.map((m, idx) => (
              <Message key={idx} label={m.user?.id}>
                {m.message}
              </Message>
            ))
          ) : (
            <div>Comece a conversar agora mesmo!</div>
          )}
        </div>
      </div>

      <form className="flex gap-2 mt-4 px-4" onSubmit={handleSubmit}>
        <div className="w-full p-2 bg-gray-100 rounded ring-2 ring-indigo-300">
          <input
            className="w-full bg-transparent outline-none text-sm"
            value={message}
            onChange={(e) => setMessage(e.currentTarget.value)}
          />
        </div>
        <button className="bg-green-600 text-white px-3 text-sm rounded">
          Enviar
        </button>
      </form>
    </div>
  );
}
