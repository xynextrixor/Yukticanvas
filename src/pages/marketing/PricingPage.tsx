export default function PricingPage() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-24 text-center">
      <h1 className="font-display font-black text-5xl mb-6">Simple, transparent pricing</h1>
      <p className="text-xl text-text-muted mb-12">Start for free, upgrade when you need more power.</p>
      <div className="grid md:grid-cols-3 gap-8 text-left">
        {[
          { name: 'Free', price: '$0', desc: 'Perfect for exploring and small projects.', features: ['3 workspaces', 'Unlimited collaborators', 'Basic shapes'] },
          { name: 'Pro', price: '$12', desc: 'For independent creators and freelancers.', features: ['Unlimited workspaces', 'PDF export', 'Custom templates', 'Version history'] },
          { name: 'Team', price: '$24', desc: 'For growing teams scaling their visual workflow.', features: ['Everything in Pro', 'Team folders', 'Advanced permissions', 'SSO integration'] }
        ].map(plan => (
          <div key={plan.name} className="border border-border rounded-xl p-8 hover:shadow-xl transition-shadow bg-white">
            <h3 className="font-bold text-2xl mb-2">{plan.name}</h3>
            <div className="font-display font-black text-4xl mb-4">{plan.price}<span className="text-base text-text-muted font-normal">/mo</span></div>
            <p className="text-text-muted text-sm mb-6 pb-6 border-b border-border">{plan.desc}</p>
            <ul className="space-y-3 mb-8">
              {plan.features.map(f => (
                <li key={f} className="flex items-center text-sm"><span className="text-primary mr-2">✓</span> {f}</li>
              ))}
            </ul>
            <button className={`w-full py-3 rounded-lg font-bold text-sm ${plan.name === 'Pro' ? 'bg-primary text-white' : 'bg-gray-100 text-text-main'}`}>
              Get Started
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
