import { useNavigate } from "react-router-dom";
import { nanoid } from "nanoid";
export function Home() {
  const navigate = useNavigate();

  async function handleCreateRoom() {
    const userId = nanoid();
    const roomId = nanoid();

    navigate(`room?userId=${userId}&roomId=${roomId}`);
  }

  return (
    <div className="grid place-items-center h-screen">
      <button
        onClick={handleCreateRoom}
        className="px-6 py-4 bg-violet-800 rounded hover:bg-violet-700 hover:shadow-lg transition-all"
      >
        Criar Video Chamada
      </button>
    </div>
  );
}
