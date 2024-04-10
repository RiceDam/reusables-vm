import {createBrowserRouter, RouterProvider} from "react-router-dom";
import StartPage from "./pages/StartPage.jsx";
import ContentPage from "./pages/ContentPage.jsx";
import {useEffect} from "react";

const router = createBrowserRouter([
  {path: '/', element: <StartPage />},
  {path: 'content', element: <ContentPage />}
])

const App = () => {
  useEffect(() => {
    if (window.location.pathname !== '/') {
      window.location.href = '/'
    }
  }, [])
  return (
    <RouterProvider router={router} />
  );
};

export default App;