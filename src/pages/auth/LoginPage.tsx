import React, { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { supabase, hasValidCredentials } from "@/lib/supabase"
import { YuktiCanvasLogo } from "../../components/YuktiCanvasLogo"
import { useAuth } from "../../lib/AuthContext"
import Navbar from "../../components/Navbar"

export default function LoginPage() {
  const nav = useNavigate()
  const { mockSignIn } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      if (!hasValidCredentials()) {
        mockSignIn(email);
        nav("/app");
        return;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error
      if (!data.session) {
        throw new Error("Login successful, but no session returned. Please verify your email.");
      }

      nav("/app")
    } catch (err: any) {
      if (err.message && (err.message.includes("NetworkError") || err.message.includes("Failed to fetch"))) {
        console.warn("Network Error: Cannot reach Supabase. Falling back to mock session.");
        localStorage.setItem('use_mock_db', 'true');
        mockSignIn(email);
        nav("/app");
      } else {
        setError(err.message || 'Failed to sign in')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex text-text-main bg-white pt-24 relative">
      <Navbar />
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-sm">
          <div className="mb-10 text-center">
            <Link to="/" className="inline-flex items-center hover:opacity-90 transition-opacity mb-8">
               <YuktiCanvasLogo height={40} />
            </Link>
            <h1 className="font-display font-bold text-3xl mb-2">Welcome back</h1>
            <p className="text-text-muted text-sm">Enter your details to sign in to your account</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 rounded-lg text-sm text-center">
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleLogin}>
            <div className="space-y-1">
              <label className="text-sm font-bold">Email</label>
              <Input 
                placeholder="name@company.com" 
                type="email" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                required 
              />
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold">Password</label>
                <Link to="#" className="text-xs text-primary font-bold hover:underline">Forgot password?</Link>
              </div>
              <Input 
                placeholder="••••••••" 
                type="password" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                required 
              />
            </div>
            <Button className="w-full py-6 text-base" type="submit" disabled={loading}>
              {loading ? "Logging in..." : "Log in"}
            </Button>
          </form>

          <div className="mt-8 pt-8 border-t border-border">
            <Button variant="outline" className="w-full mb-4 py-6 font-medium">
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
              Sign in with Google
            </Button>
            <p className="text-center text-sm text-text-muted">
              Don't have an account? <Link to="/signup" className="text-primary font-bold hover:underline">Sign up</Link>
            </p>
          </div>
        </div>
      </div>
      <div className="hidden lg:block flex-1 bg-gray-50 border-l border-border relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle,#DADADA_1px,transparent_1px)] bg-[size:20px_20px]" />
        <div className="absolute bottom-10 left-10 right-10 bg-white p-8 rounded-2xl shadow-xl border border-border">
          <div className="flex gap-2 mb-4">
            <div className="w-3 h-3 rounded-full bg-red-400"></div><div className="w-3 h-3 rounded-full bg-yellow-400"></div><div className="w-3 h-3 rounded-full bg-green-400"></div>
          </div>
          <p className="font-display font-bold text-2xl leading-tight">"YuktiCanvas transformed how our remote team brainsorms. The canvas is infinite, but the learning curve is zero."</p>
          <div className="mt-4 flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600">SJ</div>
             <div>
               <div className="font-bold text-sm">Sarah Jenkins</div>
               <div className="text-xs text-text-muted">Product Lead, TechCorp</div>
             </div>
          </div>
        </div>
      </div>
    </div>
  )
}
