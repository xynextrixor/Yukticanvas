import { Outlet, Link } from "react-router-dom"
import { YuktiCanvasLogo } from "../components/YuktiCanvasLogo"
import Navbar from "../components/Navbar"

export default function MarketingLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      
      <main className="flex-1 pt-24">
        <Outlet />
      </main>

      <footer className="bg-text-main text-white py-16">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
          <div>
            <div className="mb-6">
              <YuktiCanvasLogo height={32} />
            </div>
            <p className="text-gray-400 text-sm">
              Think visually. Build faster. The modern collaborative visual workspace.
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to="/" className="hover:text-white">Features</Link></li>
              <li><Link to="/pricing" className="hover:text-white">Pricing</Link></li>
              <li><Link to="/" className="hover:text-white">Templates</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">Resources</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to="/" className="hover:text-white">Blog</Link></li>
              <li><Link to="/" className="hover:text-white">Help Center</Link></li>
              <li><Link to="/" className="hover:text-white">Community</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to="/" className="hover:text-white">About Us</Link></li>
              <li><Link to="/" className="hover:text-white">Careers</Link></li>
              <li><Link to="/" className="hover:text-white">Contact</Link></li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  )
}
