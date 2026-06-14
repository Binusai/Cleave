import './Sections.css'

/* ============ SECTION 1: WHY CLEAVE ============ */

const whyCards = [
  { icon: 'bx-bar-chart-alt-2', title: 'Transparent Balances', desc: 'Know exactly who owes whom at any moment.' },
  { icon: 'bx-git-merge', title: 'Smart Settlements', desc: 'Reduce unnecessary transactions with intelligent settlement suggestions.' },
  { icon: 'bx-group', title: 'Shared Groups', desc: 'Manage expenses across trips, homes, projects, and events.' },
  { icon: 'bx-history', title: 'Complete History', desc: 'Every transaction is recorded and searchable.' },
]

export function WhyCleave() {
  return (
    <section className="why-cleave">
      <div className="reveal">
        <span className="section-label"><i className="bx bx-bulb" />Why Cleave</span>
        <h2 className="section-headline">
          Shared finances should bring people together, not create confusion.
        </h2>
        <p className="section-sub">
          From trips and roommates to families and teams, money should be transparent,
          fair, and easy to manage. Cleave helps everyone stay aligned with real-time
          visibility, intelligent tracking, and effortless settlements.
        </p>
      </div>
      <div className="why-cards">
        {whyCards.map((c, i) => (
          <div key={i} className="why-card reveal" style={{ transitionDelay: `${i * 0.08}s` }}>
            <div className="why-card-icon"><i className={`bx ${c.icon}`} /></div>
            <h3>{c.title}</h3>
            <p>{c.desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

/* ============ SECTION 2: FEATURE SHOWCASE ============ */

const features = [
  { icon: 'bx-receipt', title: 'Track Expenses', desc: 'Add and organize expenses effortlessly.' },
  { icon: 'bx-pie-chart-alt-2', title: 'Split Any Way', desc: 'Equal, percentage, custom amounts, shares, and advanced allocation.' },
  { icon: 'bx-revision', title: 'Recurring Expenses', desc: 'Automatically track repeated payments.' },
  { icon: 'bx-camera', title: 'Receipt Scanning', desc: 'Capture expenses instantly using AI.' },
  { icon: 'bx-category-alt', title: 'Smart Categories', desc: 'Automatically organize spending.' },
  { icon: 'bx-line-chart', title: 'Group Analytics', desc: 'Understand spending behavior across groups.' },
  { icon: 'bx-time-five', title: 'Real-Time Updates', desc: 'Everyone stays synchronized.' },
  { icon: 'bx-wifi-off', title: 'Offline Support', desc: 'Use Cleave even without internet.' },
  { icon: 'bx-search-alt', title: 'Search Everything', desc: 'Find expenses instantly.' },
  { icon: 'bx-download', title: 'Export Reports', desc: 'Generate professional summaries.' },
]

export function FeatureShowcase() {
  return (
    <section className="feature-showcase">
      <div className="reveal">
        <span className="section-label"><i className="bx bx-grid-alt" />Features</span>
        <h2 className="section-headline">Everything you need to manage shared money.</h2>
        <p className="section-sub">
          Powerful tools designed for transparency, speed, and simplicity.
        </p>
      </div>
      <div className="feature-grid">
        {features.map((f, i) => (
          <div key={i} className="feature-card reveal" style={{ transitionDelay: `${i * 0.05}s` }}>
            <div className="feature-card-icon"><i className={`bx ${f.icon}`} /></div>
            <h3>{f.title}</h3>
            <p>{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

/* ============ SECTION 3: GLOBAL FINANCE ============ */

const currencies = ['USD', 'EUR', 'GBP', 'INR', 'JPY', 'AUD', 'CAD', 'CHF', 'SGD', 'AED', 'CNY', 'KRW', 'NZD', 'SEK', 'NOK', 'DKK', 'ZAR', 'BRL', 'MXN']
const languages = ['English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 'Dutch', 'Japanese', 'Korean', 'Hindi', 'Telugu', 'Tamil']

export function GlobalFinance() {
  return (
    <section className="global-finance">
      <div className="reveal">
        <span className="section-label"><i className="bx bx-globe" />Global</span>
        <h2 className="section-headline">Built for global groups.</h2>
        <p className="section-sub">
          Whether you're splitting expenses locally or across borders,
          Cleave makes shared finances effortless.
        </p>
      </div>
      <div className="global-stats">
        <div className="global-stat-card reveal" style={{ transitionDelay: '0s' }}>
          <div className="global-stat-number">260+</div>
          <div className="global-stat-label">Currencies Supported</div>
          <div className="global-stat-tags">
            {currencies.map(c => <span key={c} className="global-stat-tag">{c}</span>)}
          </div>
        </div>
        <div className="global-stat-card reveal" style={{ transitionDelay: '0.08s' }}>
          <div className="global-stat-number">100+</div>
          <div className="global-stat-label">Countries</div>
          <p className="global-stat-desc">Millions of possible group combinations across the globe.</p>
        </div>
        <div className="global-stat-card reveal" style={{ transitionDelay: '0.16s' }}>
          <div className="global-stat-number">12+</div>
          <div className="global-stat-label">Languages</div>
          <div className="global-stat-tags">
            {languages.map(l => <span key={l} className="global-stat-tag">{l}</span>)}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ============ SECTION 4: AI SECTION ============ */

const aiFeatures = [
  { icon: 'bx-scan', title: 'AI Receipt Scanner', desc: 'Turn receipts into expenses instantly.' },
  { icon: 'bx-category', title: 'Smart Categorization', desc: 'Automatically organize spending.' },
  { icon: 'bx-trending-up', title: 'Balance Forecasting', desc: 'Predict future balances.' },
  { icon: 'bx-bell', title: 'Budget Alerts', desc: 'Know when spending exceeds expectations.' },
  { icon: 'bx-analyse', title: 'Expense Insights', desc: 'Understand patterns and habits.' },
  { icon: 'bx-git-pull-request', title: 'Settlement Optimization', desc: 'Discover the fastest settlement path.' },
]

export function AISection() {
  return (
    <section className="ai-section">
      <div className="reveal">
        <span className="section-label"><i className="bx bx-bot" />Intelligence</span>
        <h2 className="section-headline">Meet Cleave AI</h2>
        <p className="section-sub">
          Your intelligent financial assistant that learns, predicts, and optimizes.
        </p>
      </div>
      <div className="ai-grid">
        {aiFeatures.map((f, i) => (
          <div key={i} className="ai-card reveal" style={{ transitionDelay: `${i * 0.07}s` }}>
            <div className="ai-card-icon"><i className={`bx ${f.icon}`} /></div>
            <h3>{f.title}</h3>
            <p>{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

/* ============ SECTION 5: TRUST SECTION ============ */

const trustCards = [
  { icon: 'bx-user-check', title: 'Clear Ownership', desc: 'Always know who paid.' },
  { icon: 'bx-sync', title: 'Real-Time Synchronization', desc: 'Everyone sees the same information.' },
  { icon: 'bx-shield-quarter', title: 'Protected Data', desc: 'Security comes first.' },
  { icon: 'bx-file', title: 'Full Audit Trail', desc: 'Nothing gets lost.' },
]

export function TrustSection() {
  return (
    <section className="trust-section">
      <div className="reveal">
        <span className="section-label"><i className="bx bx-check-shield" />Trust</span>
        <h2 className="section-headline">Designed for trust.</h2>
        <p className="section-sub">
          Every feature in Cleave is built around transparency, accuracy, and accountability.
        </p>
      </div>
      <div className="trust-grid">
        {trustCards.map((c, i) => (
          <div key={i} className="trust-card reveal" style={{ transitionDelay: `${i * 0.08}s` }}>
            <div className="trust-card-icon"><i className={`bx ${c.icon}`} /></div>
            <h3>{c.title}</h3>
            <p>{c.desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

/* ============ SECTION 6: SOCIAL PROOF ============ */

const testimonials = [
  { role: 'Student', quote: 'Cleave keeps our apartment expenses organized. No more spreadsheets or guessing.', icon: 'bx-book-reader' },
  { role: 'Roommate', quote: 'No more awkward conversations about money. Everything is transparent and fair.', icon: 'bx-home-heart' },
  { role: 'Traveler', quote: 'Perfect for group trips. We split everything in seconds, even across currencies.', icon: 'bx-map-alt' },
  { role: 'Couple', quote: 'We finally have shared financial visibility. It changed how we manage money together.', icon: 'bx-heart' },
  { role: 'Family', quote: 'Everyone stays informed about shared expenses. No surprises, no confusion.', icon: 'bx-home-smile' },
  { role: 'Small Team', quote: 'The easiest way to manage shared costs for our team events and projects.', icon: 'bx-briefcase' },
]

export function SocialProof() {
  return (
    <section className="social-proof">
      <div className="reveal">
        <span className="section-label"><i className="bx bx-chat" />Community</span>
        <h2 className="section-headline">Trusted by people who share life together.</h2>
      </div>
      <div className="testimonial-grid">
        {testimonials.map((t, i) => (
          <div key={i} className="testimonial-card reveal" style={{ transitionDelay: `${i * 0.07}s` }}>
            <p className="testimonial-quote">"{t.quote}"</p>
            <div className="testimonial-author">
              <div className="testimonial-avatar"><i className={`bx ${t.icon}`} /></div>
              <span className="testimonial-role">{t.role}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

/* ============ SECTION 7: FINAL CTA ============ */

export function FinalCTA() {
  return (
    <section className="final-cta">
      <div className="reveal">
        <h2 className="section-headline">Ready to simplify shared finances?</h2>
        <p className="section-sub">
          Track expenses, settle balances, and gain powerful insights with Cleave.
        </p>
        <div className="cta-buttons">
          <a href="/auth" className="cta-primary">
            Get Started <i className="bx bx-right-arrow-alt" />
          </a>
          <button className="cta-secondary">
            <i className="bx bx-play-circle" /> Watch Demo
          </button>
        </div>
      </div>
    </section>
  )
}
