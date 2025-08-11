import LoginPage from "./pages/Login";
import Splash from "./pages/Splash";
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from 'react-router-dom';

const routes = [
  { path: '/login', element: <LoginPage /> },
  { path: '/dashboard', element: <Splash /> }
]

export default function AppRouter() {
  return (
    <Router>
      <Routes>
        {routes.map((route, index) => (
          <Route key={index} path={route.path} element={route.element} />
        ))}
      </Routes>
    </Router >
  )
}
