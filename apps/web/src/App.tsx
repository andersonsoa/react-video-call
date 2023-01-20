import {
  BrowserRouter,
  Route,
  Routes,
  createBrowserRouter,
} from "react-router-dom";
import { Home } from "./pages/Home";
import { Room } from "./pages/Room";
import { RoomProvider } from "./contexts/RoomContext";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
    index: true,
  },
  {
    path: "/room",
    element: <Room />,
  },
]);

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route index element={<Home />} />
        <Route
          path="room"
          element={
            <RoomProvider>
              <Room />
            </RoomProvider>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
