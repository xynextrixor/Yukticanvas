/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"

import MarketingLayout from "./layouts/MarketingLayout"
import AppLayout from "./layouts/AppLayout"
import LandingPage from "./pages/marketing/LandingPage"
import PricingPage from "./pages/marketing/PricingPage"
import LoginPage from "./pages/auth/LoginPage"
import SignupPage from "./pages/auth/SignupPage"
import DashboardPage from "./pages/app/DashboardPage"
import CanvasPage from "./pages/app/CanvasPage"
import PlaceholderPage from "./pages/app/PlaceholderPage"
import { AuthProvider } from "./lib/AuthContext"
import { hasValidCredentials } from "./lib/supabase"

import TemplatesPage from "./pages/app/TemplatesPage"
import SettingsPage from "./pages/app/SettingsPage"
import RecentPage from "./pages/app/RecentPage"

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MarketingLayout />}>
            <Route index element={<LandingPage />} />
            <Route path="pricing" element={<PricingPage />} />
          </Route>
          
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          <Route path="/app" element={<AppLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="recent" element={<RecentPage />} />
            <Route path="templates" element={<TemplatesPage />} />
            <Route path="ai" element={<PlaceholderPage />} />
            <Route path="shared" element={<PlaceholderPage />} />
            <Route path="favorites" element={<PlaceholderPage />} />
            <Route path="projects" element={<PlaceholderPage />} />
            <Route path="notifications" element={<PlaceholderPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
          
          <Route path="/board/:boardId" element={<CanvasPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}


