import React, { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { supabase, hasValidCredentials } from "@/lib/supabase"
import { YuktiCanvasLogo } from "../../components/YuktiCanvasLogo"
import { useAuth } from "../../lib/AuthContext"
import Navbar from "../../components/Navbar"

export default function SignupPage() {
  const nav = useNavigate()
  const { mockSignIn } = useAuth()
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      if (!hasValidCredentials()) {
        mockSignIn(email);
        nav("/app");
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          }
        }
      })

      if (error) throw error
      if (!data.session) {
        throw new Error("Account created! Please check your email to verify your account.");
      }

      nav("/app")
    } catch (err: any) {
      if (err.message && (err.message.includes("NetworkError") || err.message.includes("Failed to fetch"))) {
        console.warn("Network Error: Cannot reach Supabase. Falling back to mock session.");
        localStorage.setItem('use_mock_db', 'true');
        mockSignIn(email);
        nav("/app");
      } else {
        setError(err.message || 'Failed to sign up')
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
            <h1 className="font-display font-bold text-3xl mb-2">Create an account</h1>
            <p className="text-text-muted text-sm">Start your 14-day free trial. No credit card required.</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 rounded-lg text-sm text-center">
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSignup}>
            <div className="space-y-1">
              <label className="text-sm font-bold">Full Name</label>
              <Input 
                placeholder="Jane Doe" 
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)} 
                required 
              />
            </div>
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
              <label className="text-sm font-bold">Password</label>
              <Input 
                placeholder="••••••••" 
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)} 
                required 
              />
            </div>
            <Button className="w-full py-6 text-base" type="submit" disabled={loading}>
              {loading ? "Creating account..." : "Sign up"}
            </Button>
          </form>

          <div className="mt-8 pt-8 border-t border-border">
            <p className="text-center text-sm text-text-muted">
              Already have an account? <Link to="/login" className="text-primary font-bold hover:underline">Log in</Link>
            </p>
          </div>
        </div>
      </div>
      <div className="hidden lg:block flex-1 bg-gray-50 border-l border-border relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle,#DADADA_1px,transparent_1px)] bg-[size:20px_20px]" />
         <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="relative text-center">
              <svg className="absolute -top-12 -left-12 w-16 h-16 text-primary rotate-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 17l5-10 4 6 4-6 5 10Z"/><path d="M2 17h18"/></svg>
              <h2 className="font-display font-black text-6xl tracking-tight leading-none mb-4 whitespace-nowrap">THINK VISUALLY.<br/>BUILD FASTER.</h2>
              <svg className="mx-auto w-32 h-8 text-accent" viewBox="0 0 200 20" preserveAspectRatio="none"><path d="M0 10 Q 50 20 100 10 T 200 10" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round"/></svg>
            </div>
         </div>
      </div>
    </div>
  )
}
