import { Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import ChallengeCreate from './pages/ChallengeCreate'
import ChallengeDetail from './pages/ChallengeDetail'
import Analytics from './pages/Analytics'
import Profile from './pages/Profile'
import Archive from './pages/Archive'
import AppLayout from './components/layout/AppLayout'

export default function App() {
  return (
    <Routes>
      {/* Public landing page */}
      <Route path="/" element={<Landing />} />

      {/* App routes with layout */}
      <Route element={<AppLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/challenges/new" element={<ChallengeCreate />} />
        <Route path="/challenges/:id" element={<ChallengeDetail />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/archive" element={<Archive />} />
      </Route>
    </Routes>
  )
}
