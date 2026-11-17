import React, { useState, useMemo } from 'react';
import {
  FaGlobe,
  FaMobileAlt,
  FaShoppingCart,
  FaRobot,
  FaLayerGroup,
  FaWhatsapp,
  FaEnvelope,
  FaClock,
  FaCheck,
  FaShieldAlt,
  FaCreditCard,
  FaChartLine,
  FaComments,
  FaSearch,
  FaCloudUploadAlt,
  FaCalculator
} from 'react-icons/fa';
import './ProjectEstimator.css';

const PROJECT_TYPES = [
  { id: 'webapp', title: 'Web App / SaaS', icon: FaGlobe, baseINR: 28000, baseUSD: 350, desc: 'Interactive dashboards, portals & web applications' },
  { id: 'mobile', title: 'Mobile App', icon: FaMobileAlt, baseINR: 38000, baseUSD: 475, desc: 'Cross-platform iOS & Android apps via React Native' },
  { id: 'ecommerce', title: 'E-Commerce Store', icon: FaShoppingCart, baseINR: 32000, baseUSD: 400, desc: 'Product catalogs, cart, checkout & payment gateways' },
  { id: 'ai', title: 'AI Solution / Agent', icon: FaRobot, baseINR: 36000, baseUSD: 450, desc: 'LLM agents, automated workflows & AI copilot integration' },
  { id: 'landing', title: 'Corporate Website', icon: FaLayerGroup, baseINR: 16000, baseUSD: 200, desc: 'High-converting portfolio & corporate branding website' }
];

const SCOPES = [
  { id: 'starter', label: '1–3 Screens (MVP)', mult: 1.0, days: '7–12 Days', desc: 'Core proof-of-concept or focused single-flow app' },
  { id: 'growth', label: '4–8 Screens (Growth)', mult: 1.45, days: '14–22 Days', desc: 'Standard production platform with complete user journeys' },
  { id: 'scale', label: '9–15 Screens (Scale)', mult: 2.1, days: '25–35 Days', desc: 'Multi-role portals, workflows & intricate state logic' },
  { id: 'enterprise', label: '16+ Screens (Enterprise)', mult: 3.0, days: '40–60 Days', desc: 'Extensive multi-tenant SaaS or custom operational system' }
];

const ADDONS = [
  { id: 'auth', label: 'User Auth & Role Management', icon: FaShieldAlt, inr: 6000, usd: 75 },
  { id: 'payments', label: 'Payment Gateway (Razorpay/Stripe)', icon: FaCreditCard, inr: 7500, usd: 95 },
  { id: 'admin', label: 'Admin CMS & Analytics Dashboard', icon: FaChartLine, inr: 8500, usd: 105 },
  { id: 'ai_tool', label: 'Custom AI Assistant / Gemini LLM', icon: FaRobot, inr: 12000, usd: 150 },
  { id: 'chat', label: 'Real-Time Chat & WebSockets', icon: FaComments, inr: 8000, usd: 100 },
  { id: 'seo', label: 'Technical SEO & Speed Optimization', icon: FaSearch, inr: 4500, usd: 60 },
  { id: 'cloud', label: 'Cloud Architecture & CI/CD Pipeline', icon: FaCloudUploadAlt, inr: 6500, usd: 80 }
];

const TIMELINES = [
  { id: 'standard', label: 'Standard (3–5 Weeks)', mult: 1.0, badge: 'Recommended' },
  { id: 'express', label: 'Express Rush (1–2 Weeks)', mult: 1.25, badge: '+25% Priority' },
  { id: 'relaxed', label: 'Phased / Flexible (6+ Weeks)', mult: 0.92, badge: '8% Value Saving' }
];

export default function ProjectEstimator() {
  const [selectedType, setSelectedType] = useState('webapp');
  const [selectedScope, setSelectedScope] = useState('growth');
  const [selectedAddons, setSelectedAddons] = useState(['auth', 'admin']);
  const [selectedTimeline, setSelectedTimeline] = useState('standard');

  // Contact form state for direct email proposal submission
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientNotes, setClientNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const toggleAddon = (id) => {
    setSelectedAddons(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Calculation Engine
  const estimate = useMemo(() => {
    const typeObj = PROJECT_TYPES.find(t => t.id === selectedType) || PROJECT_TYPES[0];
    const scopeObj = SCOPES.find(s => s.id === selectedScope) || SCOPES[1];
    const timelineObj = TIMELINES.find(t => t.id === selectedTimeline) || TIMELINES[0];

    const addonsINR = selectedAddons.reduce((acc, id) => {
      const addon = ADDONS.find(a => a.id === id);
      return acc + (addon ? addon.inr : 0);
    }, 0);

    const addonsUSD = selectedAddons.reduce((acc, id) => {
      const addon = ADDONS.find(a => a.id === id);
      return acc + (addon ? addon.usd : 0);
    }, 0);

    const rawINR = (typeObj.baseINR * scopeObj.mult + addonsINR) * timelineObj.mult;
    const rawUSD = (typeObj.baseUSD * scopeObj.mult + addonsUSD) * timelineObj.mult;

    const minINR = Math.round((rawINR * 0.9) / 500) * 500;
    const maxINR = Math.round((rawINR * 1.15) / 500) * 500;

    const minUSD = Math.round((rawUSD * 0.9) / 10) * 10;
    const maxUSD = Math.round((rawUSD * 1.15) / 10) * 10;

    return {
      typeTitle: typeObj.title,
      scopeLabel: scopeObj.label,
      timelineLabel: timelineObj.label,
      days: scopeObj.days,
      minINR: minINR.toLocaleString('en-IN'),
      maxINR: maxINR.toLocaleString('en-IN'),
      minUSD: minUSD.toLocaleString('en-US'),
      maxUSD: maxUSD.toLocaleString('en-US'),
      addonsCount: selectedAddons.length
    };
  }, [selectedType, selectedScope, selectedAddons, selectedTimeline]);

  // Construct WhatsApp Link
  const handleWhatsAppClick = () => {
    const addonNames = selectedAddons
      .map(id => ADDONS.find(a => a.id === id)?.label)
      .filter(Boolean)
      .join(', ');

    const text = `Hi Nexbyte Team!\n\nI just configured an instant project quote on your website:\n\n` +
      `📌 *Project Type:* ${estimate.typeTitle}\n` +
      `📐 *Scope:* ${estimate.scopeLabel}\n` +
      `⚡ *Features:* ${addonNames || 'Standard Setup'}\n` +
      `⏱️ *Timeline:* ${estimate.timelineLabel}\n` +
      `💰 *Estimated Budget:* ₹${estimate.minINR} - ₹${estimate.maxINR} ($${estimate.minUSD} - $${estimate.maxUSD})\n\n` +
      `I'd like to discuss the next steps and get an official project roadmap.`;

    const encoded = encodeURIComponent(text);
    window.open(`https://wa.me/919175603240?text=${encoded}`, '_blank');
  };

  // Submit Proposal via Email API
  const handleEmailProposalSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError('');

    try {
      const addonNames = selectedAddons
        .map(id => ADDONS.find(a => a.id === id)?.label)
        .filter(Boolean);

      const res = await fetch('/api/quote-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: clientName,
          email: clientEmail,
          phone: clientPhone,
          projectType: estimate.typeTitle,
          scope: estimate.scopeLabel,
          features: addonNames,
          urgency: estimate.timelineLabel,
          estimateRangeINR: `₹${estimate.minINR} - ₹${estimate.maxINR}`,
          estimateRangeUSD: `$${estimate.minUSD} - $${estimate.maxUSD}`,
          notes: clientNotes
        })
      });

      const data = await res.json();
      if (res.ok) {
        setSubmitSuccess(true);
      } else {
        setSubmitError(data.message || 'Failed to submit quote request.');
      }
    } catch (err) {
      console.error(err);
      setSubmitError('Network error. Please try again or message us on WhatsApp.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="estimator-section" id="quote-calculator">
      <div className="estimator-container">
        <div className="estimator-header">
          <span className="section-pill">
            <FaCalculator /> Instant Quote Calculator
          </span>
          <h2 className="estimator-title">Estimate Your Project Cost in 60 Seconds</h2>
          <p className="estimator-subtitle">
            Transparent pricing, customized architecture, zero hidden surprises. Pick your requirements below to see an instant estimate.
          </p>
        </div>

        <div className="estimator-grid">
          {/* Controls Column */}
          <div className="estimator-controls">
            {/* Step 1: Project Type */}
            <div className="estimator-block">
              <label className="block-label">1. Select Project Type</label>
              <div className="type-buttons-grid">
                {PROJECT_TYPES.map(type => {
                  const Icon = type.icon;
                  const active = selectedType === type.id;
                  return (
                    <button
                      key={type.id}
                      type="button"
                      className={`type-btn ${active ? 'active' : ''}`}
                      onClick={() => setSelectedType(type.id)}
                    >
                      <Icon className="type-icon" />
                      <div className="type-info">
                        <span className="type-title">{type.title}</span>
                        <span className="type-desc">{type.desc}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Scope & Screens */}
            <div className="estimator-block">
              <label className="block-label">2. Estimated Size & Scope</label>
              <div className="scope-pills-grid">
                {SCOPES.map(scope => {
                  const active = selectedScope === scope.id;
                  return (
                    <button
                      key={scope.id}
                      type="button"
                      className={`scope-pill ${active ? 'active' : ''}`}
                      onClick={() => setSelectedScope(scope.id)}
                    >
                      <span className="scope-name">{scope.label}</span>
                      <span className="scope-time"><FaClock /> {scope.days}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 3: Addons & Features */}
            <div className="estimator-block">
              <label className="block-label">3. Core Features & Architecture Add-ons</label>
              <div className="addons-grid">
                {ADDONS.map(addon => {
                  const Icon = addon.icon;
                  const active = selectedAddons.includes(addon.id);
                  return (
                    <button
                      key={addon.id}
                      type="button"
                      className={`addon-btn ${active ? 'active' : ''}`}
                      onClick={() => toggleAddon(addon.id)}
                    >
                      <span className="addon-check">
                        {active ? <FaCheck /> : null}
                      </span>
                      <Icon className="addon-icon" />
                      <span className="addon-label">{addon.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 4: Urgency */}
            <div className="estimator-block">
              <label className="block-label">4. Target Timeline</label>
              <div className="timeline-options">
                {TIMELINES.map(tl => {
                  const active = selectedTimeline === tl.id;
                  return (
                    <button
                      key={tl.id}
                      type="button"
                      className={`timeline-btn ${active ? 'active' : ''}`}
                      onClick={() => setSelectedTimeline(tl.id)}
                    >
                      <span className="timeline-title">{tl.label}</span>
                      <span className="timeline-badge">{tl.badge}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Live Quote Output Card */}
          <div className="estimator-summary-col">
            <div className="summary-card">
              <div className="summary-top">
                <span className="summary-badge">Live Estimate</span>
                <span className="guarantee-text">No Obligation</span>
              </div>

              <div className="price-display">
                <div className="price-primary">
                  <span className="currency">₹</span>
                  <span className="amount">{estimate.minINR} – {estimate.maxINR}</span>
                </div>
                <div className="price-usd">
                  Approx. ${estimate.minUSD} – ${estimate.maxUSD} USD
                </div>
              </div>

              <div className="specs-breakdown">
                <div className="spec-row">
                  <span>Architecture:</span>
                  <strong>{estimate.typeTitle}</strong>
                </div>
                <div className="spec-row">
                  <span>Scope:</span>
                  <strong>{estimate.scopeLabel}</strong>
                </div>
                <div className="spec-row">
                  <span>Selected Features:</span>
                  <strong>{estimate.addonsCount} Modules</strong>
                </div>
                <div className="spec-row">
                  <span>Estimated Delivery:</span>
                  <strong>{estimate.days}</strong>
                </div>
              </div>

              <div className="summary-perks">
                <div className="perk-item">✓ 100% Full Source Code Ownership</div>
                <div className="perk-item">✓ 30 Days Free Post-Launch Support</div>
                <div className="perk-item">✓ Milestone-Based Escrow Invoicing</div>
              </div>

              {/* Action Buttons */}
              <div className="summary-actions">
                <button
                  type="button"
                  className="btn-whatsapp"
                  onClick={handleWhatsAppClick}
                >
                  <FaWhatsapp /> Send Brief on WhatsApp
                </button>
                <button
                  type="button"
                  className="btn-email-quote"
                  onClick={() => setShowEmailModal(true)}
                >
                  <FaEnvelope /> Email Me Official Proposal
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Modal: Email Official Proposal */}
        {showEmailModal && (
          <div className="quote-modal-overlay" onClick={() => setShowEmailModal(false)}>
            <div className="quote-modal" onClick={e => e.stopPropagation()}>
              <button className="modal-close" onClick={() => setShowEmailModal(false)}>✕</button>
              
              {!submitSuccess ? (
                <>
                  <h3>Receive Your Detailed Proposal</h3>
                  <p className="modal-sub">
                    We'll email you a full milestone roadmap and formal scope breakdown for <strong>{estimate.typeTitle}</strong>.
                  </p>

                  <form onSubmit={handleEmailProposalSubmit} className="quote-modal-form">
                    <div className="form-group">
                      <label>Your Name *</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g., Emily Watson"
                        value={clientName}
                        onChange={e => setClientName(e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Work Email *</label>
                      <input
                        type="email"
                        className="form-control"
                        placeholder="you@company.com"
                        value={clientEmail}
                        onChange={e => setClientEmail(e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Phone / WhatsApp (Optional)</label>
                      <input
                        type="tel"
                        className="form-control"
                        placeholder="+91 98765 43210"
                        value={clientPhone}
                        onChange={e => setClientPhone(e.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <label>Project Details / Custom Requests</label>
                      <textarea
                        className="form-control"
                        rows="3"
                        placeholder="Tell us about your brand, target audience, or specific requirements..."
                        value={clientNotes}
                        onChange={e => setClientNotes(e.target.value)}
                      />
                    </div>

                    {submitError && <div className="alert-box error"><p>{submitError}</p></div>}

                    <button type="submit" className="btn btn-primary submit-btn" disabled={submitting}>
                      {submitting ? 'Generating Proposal...' : 'Send Me My Proposal'}
                    </button>
                  </form>
                </>
              ) : (
                <div className="modal-success-state">
                  <div className="success-icon">🎉</div>
                  <h3>Proposal Request Sent!</h3>
                  <p>
                    We have dispatched a confirmation summary to <strong>{clientEmail}</strong>. Our lead architect will review your brief within 24 hours.
                  </p>
                  <button className="btn btn-primary" onClick={() => { setShowEmailModal(false); setSubmitSuccess(false); }}>
                    Done
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
