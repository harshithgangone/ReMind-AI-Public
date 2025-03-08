import { Navigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

const ProtectedRoute = ({ children, requireOnboarding = true }) => {
  const { currentUser } = useAuth()

  if (!currentUser) {
    return <Navigate to="/" />
  }

  if (requireOnboarding && !currentUser.onboardingComplete) {
    return <Navigate to="/occupation" />
  }

  return children
}

export default ProtectedRoute

