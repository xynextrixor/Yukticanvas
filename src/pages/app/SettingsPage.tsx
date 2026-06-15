import React from "react"
import { User, Mail, Shield, LogOut, CreditCard, Database, Settings } from "lucide-react"
import { useAuth } from "../../lib/AuthContext"
import { Button } from "@/components/ui/button"

export default function SettingsPage() {
  const { user, signOut } = useAuth();
  const userInitial = user?.email ? user.email.charAt(0).toUpperCase() : "U";
  const [localDarkMode, setLocalDarkMode] = React.useState(() => localStorage.getItem('canvas-dark-mode') === 'true');

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[800px] mx-auto space-y-8 bg-[#FAFAFA] min-h-full">
      <div className="flex items-center gap-4 border-b border-gray-200 pb-6 mb-8">
        <div className="w-12 h-12 bg-white text-gray-700 rounded-xl flex items-center justify-center border border-gray-200 flex-shrink-0 shadow-sm">
          <User size={24} />
        </div>
        <div>
          <h1 className="font-semibold text-2xl text-[#111111] tracking-tight">Account Profile</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your profile, billing, and security preferences.</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Profile Section */}
        <section className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <User size={18} className="text-gray-500" /> User Profile
          </h2>
          <div className="flex flex-col sm:flex-row items-start gap-8">
            <div className="flex flex-col items-center gap-3">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-4xl font-bold flex-shrink-0 shadow-inner">
                {userInitial}
              </div>
              <Button variant="outline" size="sm" className="w-full">Edit Avatar</Button>
            </div>
            
            <div className="space-y-5 flex-1 w-full">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 px-3 py-2 rounded-lg text-gray-600">
                  <Mail size={16} className="text-gray-400" />
                  <span>{user?.email || "No email provided"}</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Account ID</label>
                <div className="bg-gray-50 border border-gray-200 px-3 py-2 rounded-lg text-xs text-gray-500 font-mono break-all text-ellipsis overflow-hidden">
                  {user?.id || "Unknown"}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Name</label>
                <input 
                  type="text" 
                  defaultValue={user?.user_metadata?.full_name || ""} 
                  placeholder="Enter your full name"
                  className="w-full bg-white border border-gray-300 px-3 py-2 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                />
              </div>
              <Button>Save Profile Changes</Button>
            </div>
          </div>
        </section>

        {/* Plan / Billing */}
        <section className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <CreditCard size={18} className="text-gray-500" /> Subscription Plan
          </h2>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 border border-indigo-100 bg-indigo-50/50 rounded-xl gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold text-indigo-900">Pro Tier</h3>
                <span className="bg-indigo-100 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded-full">ACTIVE</span>
              </div>
              <p className="text-sm text-indigo-700/80">You have unlimited boards and premium templates.</p>
            </div>
            <Button variant="outline" className="bg-white whitespace-nowrap">Manage Billing</Button>
          </div>
        </section>

        {/* App Preferences */}
        <section className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Settings size={18} className="text-indigo-600" /> App Preferences
          </h2>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-3 gap-4">
              <div>
                <h3 className="font-medium text-gray-900">Dark Mode Canvas</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Enables or disables dark mode (<span className="font-mono bg-gray-100 px-1 py-0.5 rounded text-xs">#525252</span>) for all drawing canvases.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const nextVal = !localDarkMode;
                  localStorage.setItem('canvas-dark-mode', String(nextVal));
                  setLocalDarkMode(nextVal);
                  // Dispatch storage event to alert other sheets/canvases instantly
                  window.dispatchEvent(new Event('storage'));
                }}
                className={`w-11 h-6 rounded-full p-0.5 transition-colors duration-200 focus:outline-none ${localDarkMode ? "bg-indigo-600" : "bg-gray-200"}`}
                title="Toggle Dark Mode"
              >
                <div className={`bg-white w-5 h-5 rounded-full shadow-md transform duration-200 ${localDarkMode ? "translate-x-5" : "translate-x-0"}`} />
              </button>
            </div>
          </div>
        </section>

        {/* Database Section */}
        <section className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm mt-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Database size={18} className="text-blue-500" /> Database Connection
          </h2>
          <div className="space-y-4">
             <p className="text-sm text-gray-500 mb-4">Connect your own Supabase project to persist your boards in the cloud.</p>
             <form onSubmit={(e) => {
               e.preventDefault();
               const fd = new FormData(e.currentTarget);
               const url = (fd.get('url') as string).trim();
               const key = (fd.get('key') as string).trim();
               if (url && key) {
                 import('../../lib/supabase').then(m => m.saveSupabaseCredentials(url, key));
               }
             }}>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Supabase URL</label>
                    <input name="url" type="text" placeholder="https://xyzcompany.supabase.co" className="w-full bg-white border border-gray-300 px-3 py-2 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Supabase Anon Key</label>
                    <input name="key" type="password" placeholder="eyJh..." className="w-full bg-white border border-gray-300 px-3 py-2 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors" />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button type="submit">Save Database Credentials</Button>
                    <Button type="button" variant="outline" onClick={() => import('../../lib/supabase').then(m => m.clearSupabaseCredentials())}>Clear</Button>
                  </div>
                </div>
             </form>
          </div>
        </section>

        {/* Security Section */}
        <section className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm border-t-4 border-t-red-500 mt-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Shield size={18} className="text-red-500" /> Security & Access
          </h2>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-3 border-b border-gray-100 gap-4">
              <div>
                <h3 className="font-medium text-gray-900">Change Password</h3>
                <p className="text-sm text-gray-500 mt-1">Update your authentication credentials.</p>
              </div>
              <Button variant="outline">Reset Password</Button>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-3 gap-4">
              <div>
                <h3 className="font-medium text-gray-900">Log Out</h3>
                <p className="text-sm text-gray-500 mt-1">Securely terminate your current session on this device.</p>
              </div>
              <Button variant="destructive" onClick={signOut} className="flex items-center gap-2">
                <LogOut size={16} /> End Session
              </Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
