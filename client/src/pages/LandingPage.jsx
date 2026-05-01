import { useEffect, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';

/* ───── data ───── */
const MARQUEE_ITEMS = [
  'Fresh Milk', 'Organic Paneer', 'Pure Ghee', 'Natural Curd',
  'Farm Butter', 'Fresh Cream', 'Buttermilk', 'Cheese',
  'Flavoured Yogurt', 'Milk Powder', 'Condensed Milk', 'Whipped Cream',
];

const CATEGORIES = [
  { emoji: '🥛', name: 'Milk', count: '24 products' },
  { emoji: '🧀', name: 'Paneer', count: '12 products' },
  { emoji: '🫕', name: 'Ghee', count: '8 products' },
  { emoji: '🍶', name: 'Curd', count: '15 products' },
  { emoji: '🍦', name: 'Cream', count: '10 products' },
  { emoji: '🧈', name: 'Butter', count: '9 products' },
];

const FEATURES = [
  { num: '01', icon: '🚜', title: 'Farm Fresh Daily', desc: 'Sourced directly from local organic farms every morning. No middlemen, no preservatives — just pure, fresh dairy.' },
  { num: '02', icon: '🚚', title: 'Express Delivery', desc: '98% on-time delivery before 7 AM. Temperature-controlled logistics ensures your dairy stays fresh.' },
  { num: '03', icon: '📅', title: 'Flexible Plans', desc: 'Daily, alternate day, or weekly subscriptions. Pause, modify, or cancel anytime with zero hassle.' },
];

const TESTIMONIALS = [
  { stars: 5, text: "DairyFresh has completely changed how we consume dairy. The milk tastes like it used to in my grandmother's village. Absolutely love the subscription model!", name: 'Priya Sharma', role: 'Customer since 2024', initials: 'PS' },
  { stars: 5, text: "As a chef, quality matters. DairyFresh's paneer and ghee are unmatched. The consistency and freshness are remarkable every single time.", name: 'Rahul Mehra', role: 'Professional Chef', initials: 'RM' },
  { stars: 5, text: "Best dairy delivery service! Never missed a delivery, and the app makes it so easy to manage my family's daily needs. Highly recommended!", name: 'Anita Desai', role: 'Family of 5', initials: 'AD' },
];

const PLANS = ['Daily', 'Alternate Days', 'Weekly'];

/* ───── component ───── */
export default function LandingPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activePlan, setActivePlan] = useState(0);
  const cursorDot = useRef(null);
  const cursorRing = useRef(null);

  /* ── custom cursor ── */
  const onMouseMove = useCallback((e) => {
    const { clientX: x, clientY: y } = e;
    if (cursorDot.current) {
      cursorDot.current.style.left = `${x}px`;
      cursorDot.current.style.top = `${y}px`;
    }
    if (cursorRing.current) {
      requestAnimationFrame(() => {
        if (cursorRing.current) {
          cursorRing.current.style.left = `${x}px`;
          cursorRing.current.style.top = `${y}px`;
        }
      });
    }
  }, []);

  const [hovering, setHovering] = useState(false);
  useEffect(() => {
    window.addEventListener('mousemove', onMouseMove);
    const handleOver = (e) => {
      if (e.target.closest('a, button')) setHovering(true);
    };
    const handleOut = (e) => {
      if (e.target.closest('a, button')) setHovering(false);
    };
    document.addEventListener('mouseover', handleOver);
    document.addEventListener('mouseout', handleOut);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseover', handleOver);
      document.removeEventListener('mouseout', handleOut);
    };
  }, [onMouseMove]);

  /* ── scroll reveal ── */
  useEffect(() => {
    const els = document.querySelectorAll('.lp-reveal');
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } }),
      { threshold: 0.15 }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return (
    <div className="landing-page">
      {/* Cursor */}
      <div ref={cursorDot} className="cursor-dot" style={{ transform: `translate(-50%,-50%)` }} />
      <div ref={cursorRing} className={`cursor-ring${hovering ? ' hovering' : ''}`} style={{ transform: `translate(-50%,-50%)` }} />

      {/* ─── Navbar ─── */}
      <nav className="lp-navbar" id="navbar">
        <div className="lp-navbar-inner">
          <Link to="/" className="lp-logo">
            <div className="lp-logo-icon">🥛</div>
            <span className="lp-logo-text">DairyFresh</span>
          </Link>

          <ul className="lp-nav-links">
            <li><a href="#categories">Categories</a></li>
            <li><a href="#features">Why Us</a></li>
            <li><a href="#subscriptions">Plans</a></li>
            <li><a href="#testimonials">Reviews</a></li>
          </ul>

          <div className="lp-nav-actions">
            <Link to="/login" className="lp-btn-ghost">Log in</Link>
            <Link to="/signup" className="lp-btn-primary">Sign up free</Link>
          </div>

          <button className="lp-mobile-toggle" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu">
            {mobileOpen ? '✕' : '☰'}
          </button>
        </div>

        <div className={`lp-mobile-menu${mobileOpen ? ' open' : ''}`}>
          <a href="#categories" onClick={() => setMobileOpen(false)}>Categories</a>
          <a href="#features" onClick={() => setMobileOpen(false)}>Why Us</a>
          <a href="#subscriptions" onClick={() => setMobileOpen(false)}>Plans</a>
          <a href="#testimonials" onClick={() => setMobileOpen(false)}>Reviews</a>
          <Link to="/login" onClick={() => setMobileOpen(false)} style={{ color: 'var(--lp-green)' }}>Log in</Link>
          <Link to="/signup" onClick={() => setMobileOpen(false)} className="lp-btn-primary" style={{ textAlign: 'center', marginTop: 8 }}>Sign up free</Link>
        </div>
      </nav>

      {/* ─── Hero ─── */}
      <section className="lp-hero" id="hero">
        <div className="lp-blob lp-blob-1" />
        <div className="lp-blob lp-blob-2" />

        <div className="lp-hero-content">
          <div className="lp-hero-badge">
            <span className="lp-badge-dot" />
            Farm Fresh • Delivered Daily
          </div>

          <h1>Fresh Dairy,<br />Straight from<br /><em>the Farm</em></h1>

          <p className="lp-hero-sub">
            Premium, organic dairy products delivered to your doorstep before sunrise. Subscribe once, enjoy freshness every day.
          </p>

          <div className="lp-hero-btns">
            <Link to="/signup" className="lp-btn-lg primary">
              Start My Subscription →
            </Link>
            <Link to="/login" className="lp-btn-lg outline">
              I have an account
            </Link>
          </div>

          <div className="lp-hero-stats">
            <div className="lp-stat">
              <h3>12K+</h3>
              <p>Happy customers</p>
            </div>
            <div className="lp-stat">
              <h3>98%</h3>
              <p>On-time delivery</p>
            </div>
            <div className="lp-stat">
              <h3>50+</h3>
              <p>Dairy products</p>
            </div>
          </div>
        </div>

        <div className="lp-hero-visual">
          <div className="lp-float-card">
            <div className="lp-float-card-emoji">🥛</div>
            <h4>Farm Milk</h4>
            <p>500ml • Organic</p>
            <div className="lp-float-card-price">₹45</div>
          </div>
          <div className="lp-float-card">
            <div className="lp-float-card-emoji">🧀</div>
            <h4>Fresh Paneer</h4>
            <p>200g • Handmade</p>
            <div className="lp-float-card-price">₹120</div>
          </div>
          <div className="lp-float-card">
            <div className="lp-float-card-emoji">🫕</div>
            <h4>Pure Ghee</h4>
            <p>500ml • A2 Desi</p>
            <div className="lp-float-card-price">₹650</div>
          </div>
          <div className="lp-delivery-tag">
            <span>🚚</span> Delivery by 6 AM
          </div>
        </div>
      </section>

      {/* ─── Marquee ─── */}
      <div className="lp-marquee">
        <div className="lp-marquee-track">
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
            <div className="lp-marquee-item" key={i}>
              <span className="lp-marquee-dot" />
              {item}
            </div>
          ))}
        </div>
      </div>

      {/* ─── Categories ─── */}
      <section className="lp-section lp-reveal" id="categories">
        <div className="lp-section-label">🗂️ Categories</div>
        <h2 className="lp-section-title">Explore Our Range</h2>
        <p className="lp-section-desc">From farm-fresh milk to artisanal paneer — discover premium dairy across every category.</p>
        <div className="lp-categories">
          {CATEGORIES.map((c, i) => (
            <div className="lp-cat-card lp-reveal" key={i} style={{ transitionDelay: `${i * 80}ms` }}>
              <span className="lp-cat-emoji">{c.emoji}</span>
              <h3 className="lp-cat-name">{c.name}</h3>
              <p className="lp-cat-count">{c.count}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Features ─── */}
      <section className="lp-section lp-reveal" id="features">
        <div className="lp-section-label">✨ Why DairyFresh</div>
        <h2 className="lp-section-title">The DairyFresh Difference</h2>
        <p className="lp-section-desc">We&apos;re not just a delivery service — we&apos;re a promise of purity, freshness, and convenience.</p>
        <div className="lp-features">
          {FEATURES.map((f, i) => (
            <div className="lp-feat-card lp-reveal" key={i} style={{ transitionDelay: `${i * 100}ms` }}>
              <div className="lp-feat-ghost">{f.num}</div>
              <div className="lp-feat-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Subscription ─── */}
      <section className="lp-reveal" id="subscriptions" style={{ padding: '60px 0' }}>
        <div className="lp-subs-banner">
          <h2>Never Run Out of Dairy</h2>
          <p>Choose a subscription plan that fits your lifestyle. Cancel or modify anytime.</p>
          <div className="lp-plan-pills">
            {PLANS.map((p, i) => (
              <button className={`lp-pill${activePlan === i ? ' active' : ''}`} key={i} onClick={() => setActivePlan(i)}>
                {p}
              </button>
            ))}
          </div>
          <br />
          <Link to="/signup" className="lp-subs-cta">
            Start My Subscription →
          </Link>
        </div>
      </section>

      {/* ─── Testimonials ─── */}
      <section className="lp-section lp-reveal" id="testimonials">
        <div className="lp-section-label">💬 Testimonials</div>
        <h2 className="lp-section-title">Loved by Thousands</h2>
        <p className="lp-section-desc">See what our customers say about their DairyFresh experience.</p>
        <div className="lp-testimonials">
          {TESTIMONIALS.map((t, i) => (
            <div className="lp-test-card lp-reveal" key={i} style={{ transitionDelay: `${i * 100}ms` }}>
              <div className="lp-test-stars">{'⭐'.repeat(t.stars)}</div>
              <p className="lp-test-text">&ldquo;{t.text}&rdquo;</p>
              <div className="lp-test-author">
                <div className="lp-test-avatar">{t.initials}</div>
                <div>
                  <p className="lp-test-name">{t.name}</p>
                  <p className="lp-test-role">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Final CTA ─── */}
      <section className="lp-final-cta lp-reveal">
        <h2>Ready to Taste the <em style={{ color: 'var(--lp-green)' }}>Freshness</em>?</h2>
        <p>Join 12,000+ happy households who start their mornings with DairyFresh.</p>
        <div className="lp-final-btns">
          <Link to="/signup" className="lp-btn-lg primary">Create Free Account →</Link>
          <Link to="/login" className="lp-btn-lg outline">Sign In</Link>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="lp-footer">
        <div className="lp-footer-logo">
          <div className="lp-footer-logo-icon">🥛</div>
          <span className="lp-footer-logo-text">DairyFresh</span>
        </div>
        <p>© 2026 DairyFresh. All rights reserved. Made with 💚 for dairy lovers.</p>
      </footer>
    </div>
  );
}
