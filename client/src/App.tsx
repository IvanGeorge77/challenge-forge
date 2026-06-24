import { Routes, Route, Navigate } from 'react-router-dom'
import { SignedIn, SignedOut, SignIn, SignUp } from '@clerk/clerk-react'
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import ChallengeCreate from './pages/ChallengeCreate'
import ChallengeDetail from './pages/ChallengeDetail'
import ChallengeReport from './pages/ChallengeReport'
import Analytics from './pages/Analytics'
import Profile from './pages/Profile'
import Archive from './pages/Archive'
import AppLayout from './components/layout/AppLayout'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SignedIn>{children}</SignedIn>
      <SignedOut>
        <Navigate to="/sign-in" replace />
      </SignedOut>
    </>
  )
}

export default function App() {
  return (
    <Routes>
      {/* Public landing page */}
      <Route path="/" element={<Landing />} />

      {/* Auth pages */}
      <Route
        path="/sign-in/*"
        element={
          <div className="min-h-screen bg-bg-primary flex items-center justify-center">
            <SignIn
              routing="path"
              path="/sign-in"
              afterSignInUrl="/dashboard"
              appearance={{
                elements: {
                  rootBox: 'mx-auto',
                  card: 'bg-bg-card border border-border shadow-2xl',
                },
              }}
            />
          </div>
        }
      />
      <Route
        path="/sign-up/*"
        element={
          <div className="min-h-screen bg-bg-primary flex items-center justify-center">
            <SignUp
              routing="path"
              path="/sign-up"
              afterSignUpUrl="/dashboard"
              appearance={{
                elements: {
                  rootBox: 'mx-auto',
                  card: 'bg-bg-card border border-border shadow-2xl',
                },
              }}
            />
          </div>
        }
      />

      {/* Protected app routes with layout */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/challenges/new" element={<ChallengeCreate />} />
        <Route path="/challenges/:id" element={<ChallengeDetail />} />
        <Route path="/challenges/:id/report" element={<ChallengeReport />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/archive" element={<Archive />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
