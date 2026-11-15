import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

// Renders no UI of its own: children if there is a token, otherwise a redirect to /login.
// This is a convenience for the user only. The API's JwtAuthGuard is the real security check.
function ProtectedRoute({ children }) {
  const { token } = useAuth();
  const location = useLocation();

  if (!token) {
    // remember where the user was going, so login can send them back there
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}

export default ProtectedRoute;
