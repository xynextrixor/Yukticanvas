import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Check, X, Construction, Sparkles, Mail, ArrowRight } from "lucide-react";
import { useAuth } from "../../lib/AuthContext";

export default function PricingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annually">("monthly");
  const [showUnderConstruction, setShowUnderConstruction] = useState(false);
  const [selectedPlanDetails, setSelectedPlanDetails] = useState<{ name: string; price: string } | null>(null);
  const [notifiedEmail, setNotifiedEmail] = useState("");
  const [notificationSuccess, setNotificationSuccess] = useState(false);

  const handlePaidPlanClick = (planName: string, price: string) => {
    setSelectedPlanDetails({ name: planName, price });
    setNotificationSuccess(false);
    // Pre-fill email if user is logged in
    if (user?.email) {
      setNotifiedEmail(user.email);
    } else {
      setNotifiedEmail("");
    }
    setShowUnderConstruction(true);
  };

  const handleFreePlanClick = () => {
    if (user) {
      navigate("/app");
    } else {
      navigate("/signup");
    }
  };

  const handleNotifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifiedEmail) return;
    setNotificationSuccess(true);
    setTimeout(() => {
      setShowUnderConstruction(false);
    }, 2500);
  };

  return (
    <div id="pricing-page-root" className="min-h-screen bg-[#FAFAFA] text-[#111111] font-sans pb-24 pt-32 px-4 selection:bg-[#FF3B30] selection:text-white">
      {/* Background decoration elements */}
      <div id="pricing-bg-circle-1" className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-[#FFD60A]/10 blur-[120px] pointer-events-none" />
      <div id="pricing-bg-circle-2" className="absolute bottom-1/4 left-0 w-[400px] h-[400px] rounded-full bg-[#FF3B30]/5 blur-[100px] pointer-events-none" />

      <div className="max-w-6xl mx-auto text-center relative z-10">
        {/* Upper Badge */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          id="pricing-badge"
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#FFD60A]/20 border border-[#FFD60A] text-xs font-bold uppercase tracking-widest text-[#B58200] mb-8"
        >
          <Sparkles size={12} className="text-[#FF9500]" />
          PLANS FOR EVERY CREATIVE WORKFLOW
        </motion.div>

        {/* Headings */}
        <motion.h1 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          id="pricing-main-title"
          className="font-display font-black text-4xl sm:text-6xl tracking-tight leading-tight max-w-3xl mx-auto mb-6 text-[#111111]"
        >
          Simple, transparent pricing
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          id="pricing-main-subtitle"
          className="text-base sm:text-lg text-neutral-500 max-w-xl mx-auto mb-12"
        >
          Start building for free with zero commitments, upgrade instantly once our premium services launch.
        </motion.p>

        {/* Billing cycle Switcher */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          id="billing-cycle-toggle-container"
          className="inline-flex items-center gap-3 bg-white p-1 rounded-full border border-neutral-200 shadow-sm mb-16"
        >
          <button
            id="billing-cycle-monthly"
            onClick={() => setBillingCycle("monthly")}
            className={`px-4 py-2 rounded-full text-xs font-bold tracking-tight transition-all cursor-pointer ${
              billingCycle === "monthly" 
                ? "bg-[#111111] text-white shadow-sm" 
                : "text-neutral-500 hover:text-neutral-800"
            }`}
          >
            Bill Monthly
          </button>
          <button
            id="billing-cycle-annually"
            onClick={() => setBillingCycle("annually")}
            className={`relative px-4 py-2 rounded-full text-xs font-bold tracking-tight transition-all cursor-pointer flex items-center gap-1 ${
              billingCycle === "annually" 
                ? "bg-[#111111] text-white shadow-sm" 
                : "text-neutral-500 hover:text-neutral-800"
            }`}
          >
            Bill Annually
            <span className="bg-[#FF3B30] text-white font-black text-[9px] px-1.5 py-0.5 rounded-full uppercase tracking-wider scale-95 origin-left">
              Save 20%
            </span>
          </button>
        </motion.div>

        {/* Pricing Cards Grid */}
        <div id="pricing-grid-container" className="grid md:grid-cols-3 gap-8 text-left items-stretch">
          
          {/* Card 1: Free Plan */}
          <motion.div 
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            whileHover={{ y: -8, transition: { duration: 0.2 } }}
            id="pricing-card-free"
            className="flex flex-col border border-neutral-200 rounded-3xl p-8 bg-white shadow-sm relative overflow-hidden h-full group"
          >
            {/* Soft accent top border on hover */}
            <div className="absolute top-0 inset-x-0 h-1.5 bg-neutral-200 group-hover:bg-[#FFD60A] transition-colors" />

            <div className="mb-6">
              <span className="text-xs font-black tracking-widest text-[#FF3B30] uppercase">LAUNCH SPECIAL</span>
              <h3 className="font-display font-black text-3xl text-[#111111] mt-2">Free Plan</h3>
              <p className="text-neutral-400 text-xs mt-1.5">Perfect for exploring ideas and solo builders.</p>
            </div>

            <div className="mb-6 flex items-baseline">
              <span className="font-display font-black text-5xl text-[#111111]">$0</span>
              <span className="text-neutral-400 text-sm ml-1">/ forever</span>
            </div>

            <button 
              id="pricing-btn-free"
              onClick={handleFreePlanClick}
              className="w-full py-4 px-6 rounded-2xl font-bold text-sm bg-neutral-100 hover:bg-[#FFD60A] text-[#111111] hover:shadow-[0_4px_16px_rgba(255,214,10,0.4)] transition-all active:scale-[0.98] cursor-pointer text-center flex items-center justify-center gap-2 mb-8"
            >
              Get Started Free <ArrowRight size={14} />
            </button>

            {/* Divider */}
            <div className="border-b border-neutral-100 mb-8" />

            {/* Features lists */}
            <ul className="space-y-4 flex-grow mb-4">
              {[
                "Up to 3 high-performance boards",
                "Unlimited external collaborators",
                "Full diagram shapes suite",
                "Advanced connector lines snap-to",
                "Export maps as responsive PNG images",
                "Secure browser local storage sync"
              ].map((f, idx) => (
                <li key={idx} id={`feature-free-${idx}`} className="flex items-start text-sm text-neutral-600">
                  <span className="text-emerald-500 mr-3 shrink-0 bg-emerald-50 p-0.5 rounded-full font-bold">✓</span> 
                  {f}
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Card 2: Pro Plan (Paid) */}
          <motion.div 
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{ y: -8, transition: { duration: 0.2 } }}
            id="pricing-card-pro"
            className="flex flex-col border-2 border-[#111111] rounded-3xl p-8 bg-white shadow-[0_12px_24px_rgba(17,17,17,0.06)] relative overflow-hidden h-full group"
          >
            {/* Pop design bar */}
            <div className="absolute top-0 inset-x-0 h-1.5 bg-[#FFD60A]" />
            
            {/* Popular Badge */}
            <div className="absolute top-4 right-4 bg-[#FFD60A] text-black font-black text-[10px] uppercase tracking-widest px-3 py-1 rounded-full shadow-sm">
              MOST POPULAR
            </div>

            <div className="mb-6">
              <span className="text-xs font-black tracking-widest text-[#FF3B30] uppercase">POWER USER</span>
              <h3 className="font-display font-black text-3xl text-[#111111] mt-2">Pro Plan</h3>
              <p className="text-neutral-400 text-xs mt-1.5">For independent designers, makers & creators.</p>
            </div>

            <div className="mb-6 flex items-baseline">
              <span className="font-display font-black text-5xl text-[#111111]">
                {billingCycle === "monthly" ? "$12" : "$9"}
              </span>
              <span className="text-neutral-400 text-sm ml-1">/ month</span>
            </div>

            <button 
              id="pricing-btn-pro"
              onClick={() => handlePaidPlanClick("Pro Plan", billingCycle === "monthly" ? "$12/mo" : "$9/mo")}
              className="w-full py-4 px-6 rounded-2xl font-bold text-sm bg-[#111111] text-white hover:bg-[#FF3B30] hover:shadow-[0_4px_16px_rgba(255,59,48,0.35)] transition-all active:scale-[0.98] cursor-pointer text-center flex items-center justify-center gap-2 mb-8"
            >
              Upgrade to Pro <Sparkles size={14} className="text-[#FFD60A]" />
            </button>

            {/* Divider */}
            <div className="border-b border-neutral-100 mb-8" />

            {/* Features lists */}
            <ul className="space-y-4 flex-grow mb-4">
              {[
                "Everything in Free Plan Included",
                "Unlimited collaborative workspaces",
                "Premium vector SVG export options",
                "Custom visual presentation templates",
                "Detailed element version snapshots",
                "Custom workspace branding & accent colors",
                "Priority chat support query handling"
              ].map((f, idx) => (
                <li key={idx} id={`feature-pro-${idx}`} className="flex items-start text-sm text-neutral-600">
                  <span className="text-[#FF3B30] mr-3 shrink-0 bg-[#FF3B30]/5 p-0.5 rounded-full font-bold">✓</span> 
                  {f}
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Card 3: Team Plan (Paid) */}
          <motion.div 
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            whileHover={{ y: -8, transition: { duration: 0.2 } }}
            id="pricing-card-team"
            className="flex flex-col border border-neutral-200 rounded-3xl p-8 bg-white shadow-sm relative overflow-hidden h-full group"
          >
            {/* Soft accent top border on hover */}
            <div className="absolute top-0 inset-x-0 h-1.5 bg-neutral-200 group-hover:bg-[#FF3B30] transition-colors" />

            <div className="mb-6">
              <span className="text-xs font-black tracking-widest text-[#FF3B30] uppercase">SCALING TEAMS</span>
              <h3 className="font-display font-black text-3xl text-[#111111] mt-2">Team Plan</h3>
              <p className="text-neutral-400 text-xs mt-1.5">For growing groups, agencies & creative studios.</p>
            </div>

            <div className="mb-6 flex items-baseline">
              <span className="font-display font-black text-5xl text-[#111111]">
                {billingCycle === "monthly" ? "$24" : "$19"}
              </span>
              <span className="text-neutral-400 text-sm ml-1">/ month</span>
            </div>

            <button 
              id="pricing-btn-team"
              onClick={() => handlePaidPlanClick("Team Plan", billingCycle === "monthly" ? "$24/mo" : "$19/mo")}
              className="w-full py-4 px-6 rounded-2xl font-bold text-sm bg-neutral-100 hover:bg-[#111111] hover:text-white transition-all active:scale-[0.98] cursor-pointer text-center flex items-center justify-center gap-2 mb-8"
            >
              Get Started with Team <ArrowRight size={14} />
            </button>

            {/* Divider */}
            <div className="border-b border-neutral-100 mb-8" />

            {/* Features lists */}
            <ul className="space-y-4 flex-grow mb-4">
              {[
                "Everything in Pro Plan Included",
                "Shared team asset libraries",
                "Role-based granular user permissions",
                "Advanced Single Sign-On (SSO) secure login",
                "Interactive live presentations with voice feed",
                "Dedicated technical account manager (TAM)",
                "99.9% uptime Service Level Agreement (SLA)"
              ].map((f, idx) => (
                <li key={idx} id={`feature-team-${idx}`} className="flex items-start text-sm text-neutral-600">
                  <span className="text-neutral-700 mr-3 shrink-0 bg-neutral-100 p-0.5 rounded-full font-bold">✓</span> 
                  {f}
                </li>
              ))}
            </ul>
          </motion.div>

        </div>

        {/* Bottom banner details */}
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45 }}
          id="pricing-footer-hint"
          className="text-xs text-neutral-400 mt-12 max-w-lg mx-auto text-center"
        >
          Prices listed exclude relevant local sales tax where applicable. Unsure about which solution fits best? Feel welcome to reach out to our team anytime.
        </motion.p>
      </div>

      {/* Modern, Highly Polished Custom Dialog Modal (Premium is Under-Construction) */}
      <AnimatePresence>
        {showUnderConstruction && (
          <div id="underconstruction-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center bg-[#111111]/60 backdrop-blur-md p-4">
            
            {/* Modal Body Card */}
            <motion.div
              initial={{ scale: 0.93, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              transition={{ type: "spring", duration: 0.4 }}
              id="underconstruction-modal-card"
              className="bg-white rounded-3xl w-full max-w-md shadow-[0_24px_50px_-12px_rgba(17,17,17,0.25)] border-2 border-[#111111] overflow-hidden relative"
            >
              {/* Decorative Warning Yellow Header Bar */}
              <div className="h-2 bg-[#FFD60A]" />

              {/* Close Button UI wrapper */}
              <button 
                id="close-underconstruction-modal"
                onClick={() => setShowUnderConstruction(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-neutral-100 text-neutral-500 hover:text-black hover:bg-neutral-200 transition-colors active:scale-95 cursor-pointer"
                aria-label="Close dialog"
              >
                <X size={16} />
              </button>

              <div className="p-8 text-center">
                {/* Construction Graphic Element */}
                <div id="modal-accent-circle" className="w-16 h-16 mx-auto rounded-full bg-[#FFD60A]/20 border-2 border-[#FFD60A] flex items-center justify-center mb-6">
                  <Construction size={28} className="text-[#B58200] animate-bounce" />
                </div>

                {/* Main Notification Header */}
                <h3 id="modal-heading" className="font-display font-black text-2xl text-[#111111] leading-tight mb-3">
                  Premium is Under Construction
                </h3>

                <p id="modal-description" className="text-xs text-neutral-500 leading-relaxed max-w-sm mx-auto mb-6">
                  Thank you for your interest in the <span className="font-bold text-[#111111]">{selectedPlanDetails?.name} ({selectedPlanDetails?.price})</span>! 
                  Our subscription billing system and developer servers are currently under active development.
                </p>

                {/* Highlight Free Tier Callout */}
                <div id="free-tier-callout" className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 mb-6 text-left">
                  <h4 className="text-emerald-800 text-xs font-bold flex items-center gap-1.5 mb-1">
                    <span className="inline-block w-2-h-2 r-full bg-emerald-500 rounded-full animate-ping" />
                    Free Plan is Fully Operational!
                  </h4>
                  <p className="text-emerald-700 text-[11px] leading-snug">
                    You can start drawing, prototyping mockups, and collaborating with your team right now on the <span className="font-semibold text-emerald-800">Free Tier</span>. All boards will be safely persisted.
                  </p>
                </div>

                {/* Mail form */}
                <form onSubmit={handleNotifySubmit} className="space-y-3">
                  <div className="text-left">
                    <label id="notify-email-label" className="block text-[11px] font-black uppercase text-neutral-600 tracking-wider mb-1.5">
                      Get Notified When Premium Launches:
                    </label>
                    <div className="relative">
                      <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                      <input 
                        id="notify-email-input"
                        type="email" 
                        required
                        disabled={notificationSuccess}
                        value={notifiedEmail}
                        onChange={(e) => setNotifiedEmail(e.target.value)}
                        placeholder="your@email.com"
                        className="w-full text-xs font-medium pl-10 pr-4 py-3 rounded-xl border border-neutral-200 outline-none focus:ring-2 focus:ring-[#FF3B30] focus:border-[#FF3B30] transition-all bg-neutral-50/50"
                      />
                    </div>
                  </div>

                  <AnimatePresence mode="wait">
                    {notificationSuccess ? (
                      <motion.div 
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        id="notify-success-msg"
                        className="p-3 text-xs font-bold text-emerald-800 bg-emerald-100 border border-emerald-200 rounded-xl flex items-center justify-center gap-2"
                      >
                        ✓ Beautifully saved! We will notify you immediately.
                      </motion.div>
                    ) : (
                      <button 
                        id="notify-form-submit"
                        type="submit"
                        className="w-full py-3 px-5 rounded-xl text-xs font-bold bg-[#111111] text-white hover:bg-[#FF3B30] hover:shadow-[0_4px_12px_rgba(255,59,48,0.25)] transition-all cursor-pointer text-center flex items-center justify-center gap-2"
                      >
                        Notify Me <ArrowRight size={12} />
                      </button>
                    )}
                  </AnimatePresence>
                </form>

                {/* Navigation and Close trigger footer */}
                <div className="mt-6 flex gap-3 text-center">
                  <button 
                    id="underconstruction-modal-back"
                    onClick={() => setShowUnderConstruction(false)}
                    className="flex-1 py-2.5 rounded-xl text-xs font-bold text-neutral-500 hover:text-[#111111] border border-neutral-200 bg-white transition-colors cursor-pointer"
                  >
                    Close
                  </button>
                  <button 
                    id="underconstruction-modal-use-free"
                    onClick={() => {
                      setShowUnderConstruction(false);
                      handleFreePlanClick();
                    }}
                    className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-[#FFD60A] text-[#111111] hover:shadow-[0_4px_12px_rgba(255,214,10,0.3)] transition-all cursor-pointer"
                  >
                    Go Use Free Tier
                  </button>
                </div>
              </div>
            </motion.div>

          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
