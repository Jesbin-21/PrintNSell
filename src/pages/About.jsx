import "./About.css";


function About() {
 

  return (
    <div className="about-page">

      {/* HERO */}
      <section className="about-hero">
        <div className="about-hero-badge">✦ About PrintNSell</div>
        <h1>
          Where <span className="about-highlight">3D Printing</span> Meets
          the Marketplace
        </h1>
        <p>
          PrintNSell is India's first dedicated marketplace for 3D-printed
          products — connecting talented makers with buyers who appreciate
          craftsmanship, innovation, and originality.
        </p>
        <div className="about-hero-cta">
          <button className="about-btn-primary" onClick={() => navigate("/ShowCase")}>
            Explore Products
          </button>
          <button className="about-btn-secondary" onClick={() => navigate("/seller")}>
            Become a Seller
          </button>
        </div>
      </section>

      {/* STATS */}
      <section className="about-stats">
        {stats.map((s) => (
          <div className="about-stat-card" key={s.label}>
            <span className="about-stat-number">{s.number}</span>
            <span className="about-stat-label">{s.label}</span>
          </div>
        ))}
      </section>

      {/* STORY */}
      <section className="about-story">
        <div className="about-story-text">
          <div className="about-section-tag">Our Story</div>
          <h2>Built by Makers, for Makers</h2>
          <p>
            PrintNSell started in 2023 from a simple frustration — 3D printing
            hobbyists had no dedicated place to sell their work. Marketplaces
            were flooded with mass-produced items, and handcrafted prints were
            lost in the noise.
          </p>
          <p>
            We built PrintNSell to fix that. A platform tailored exclusively
            for the 3D printing community — where every listing tells a story,
            every seller is a creator, and every purchase supports independent
            craftsmanship.
          </p>
          <p>
            Today we're home to hundreds of sellers across India, offering
            everything from custom figurines and architectural models to
            functional tools and educational prototypes.
          </p>
        </div>
        <div className="about-story-visual">
          <div className="about-story-card">
            <span className="story-big-icon">🖨️</span>
            <p>
              "We want every 3D print to find a home, and every maker to find
              their market."
            </p>
            <span className="story-attr">— Arjun Mehta, Founder</span>
          </div>
        </div>
      </section>

      {/* VALUES */}
      <section className="about-values">
        <div className="about-section-center">
          <div className="about-section-tag">What We Stand For</div>
          <h2>Our Core Values</h2>
          <p>Everything we do is guided by these principles.</p>
        </div>
        <div className="about-values-grid">
          {values.map((v) => (
            <div className="about-value-card" key={v.title}>
              <span className="about-value-icon">{v.icon}</span>
              <h3>{v.title}</h3>
              <p>{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* TEAM */}
      <section className="about-team">
        <div className="about-section-center">
          <div className="about-section-tag">The People Behind It</div>
          <h2>Meet the Team</h2>
          <p>A passionate group of makers, engineers, and dreamers.</p>
        </div>
        <div className="about-team-grid">
          {team.map((member) => (
            <div className="about-team-card" key={member.name}>
              <div className="about-team-avatar">{member.emoji}</div>
              <h3>{member.name}</h3>
              <span>{member.role}</span>
            </div>
          ))}
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="about-cta-banner">
        <h2>Ready to print something amazing?</h2>
        <p>
          Join thousands of buyers and sellers already on PrintNSell.
        </p>
        <div className="about-hero-cta">
          <button className="about-btn-primary" onClick={() => navigate("/ShowCase")}>
            Shop Now
          </button>
          <button className="about-btn-secondary" onClick={() => navigate("/seller")}>
            Start Selling
          </button>
        </div>
      </section>

    </div>
  );
}

export default About;
