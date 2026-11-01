import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { lazy, Suspense } from "react";
import Layout from "./components/Layout";
import LoadingSpinner from "./components/LoadingSpinner";

// Lazy-loaded pages
const Home       = lazy(() => import("./pages/Home"));
const Explore    = lazy(() => import("./pages/Explore"));
const GamePlayer = lazy(() => import("./pages/GamePlayer"));
const Profile    = lazy(() => import("./pages/Profile"));
const Library    = lazy(() => import("./pages/Library"));
const Achievements = lazy(() => import("./pages/Achievements"));
const Kalpesh    = lazy(() => import("./pages/Kalpesh"));

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: "explore", element: <Explore /> },
      { path: "library", element: <Library /> },
      { path: "achievements", element: <Achievements /> },
      { path: "profile", element: <Profile /> },
      { path: "kalpesh", element: <Kalpesh /> },
    ],
  },
  {
    path: "/play/:gameId",
    element: (
      <Suspense fallback={<LoadingSpinner fullscreen />}>
        <GamePlayer />
      </Suspense>
    ),
  },
]);

export default function App() {
  return (
    <Suspense fallback={<LoadingSpinner fullscreen />}>
      <RouterProvider router={router} />
    </Suspense>
  );
}
