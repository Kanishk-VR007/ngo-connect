import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Home.css';

const Home = () => {
  const { isAuthenticated } = useAuth();
  const [stats, setStats] = useState({ ngos: 0, helped: 0, projects: 0, volunteers: 0 });
  const [hoveredBranch, setHoveredBranch] = useState(null);

  useEffect(() => {
    // Animate stats counting up
    const targets = { ngos: 8, helped: 135000, projects: 1040, volunteers: 3500 };
    const duration = 2000;
    const steps = 60;
    const stepTime = duration / steps;

    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      
      setStats({
        ngos: Math.floor(targets.ngos * progress),
        helped: Math.floor(targets.helped * progress),
        projects: Math.floor(targets.projects * progress),
        volunteers: Math.floor(targets.volunteers * progress)
      });

      if (currentStep >= steps) {
        clearInterval(interval);
        setStats(targets);
      }
    }, stepTime);

    return () => clearInterval(interval);
  }, []);

  const branches = [
    { id: 1, icon: '🎓', title: 'Education', description: 'Empowering through knowledge', link: '/ngos?category=Education' },
    { id: 2, icon: '🏥', title: 'Healthcare', description: 'Healing communities', link: '/ngos?category=Healthcare' },
    { id: 3, icon: '🍲', title: 'Food Security', description: 'Nourishing lives', link: '/ngos?category=Food%20%26%20Nutrition' },
    { id: 4, icon: '🏠', title: 'Shelter', description: 'Building homes & hope', link: '/ngos?category=Shelter' },
    { id: 5, icon: '👩', title: 'Women Empowerment', description: 'Strengthening voices', link: '/ngos?category=Women%20Empowerment' },
    { id: 6, icon: '🌱', title: 'Environment', description: 'Protecting our planet', link: '/ngos?category=Environmental' }
  ];

  return (
    <div className="home">
      {/* Hero Section with Tree Theme */}
      <section className="hero-tree">
        <div className="tree-background">
          <div className="tree-trunk"></div>
          <div className="tree-roots"></div>
        </div>
        
        <div className="container hero-content">
          <div className="floating-leaves">
            <span className="leaf">🍃</span>
            <span className="leaf">🍃</span>
            <span className="leaf">🍃</span>
            <span className="leaf">🍃</span>
            <span className="leaf">🍃</span>
          </div>

          <h1 className="hero-title animate-fade-in">
            <span className="tree-icon">🌳</span>
            Growing Together, Helping Each Other
          </h1>
          <p className="hero-subtitle animate-fade-in-delay">
            Like branches of a tree reaching out, we connect communities with NGOs. 
            Every contribution helps our community grow stronger.
          </p>
          
          <div className="hero-actions animate-slide-up">
            {isAuthenticated ? (
              <>
                <Link to="/ngos" className="btn btn-primary btn-lg pulse-button">
                  🔍 Explore NGOs
                </Link>
                <Link to="/dashboard" className="btn btn-secondary btn-lg">
                  📊 My Dashboard
                </Link>
              </>
            ) : (
              <>
                <Link to="/register" className="btn btn-primary btn-lg pulse-button">
                  🌱 Plant Your Impact
                </Link>
                <Link to="/ngos" className="btn btn-secondary btn-lg">
                  🌿 Discover NGOs
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Animated Roots (Impact Stats) */}
        <div className="roots-stats">
          <div className="stat-root">
            <div className="stat-value">{stats.ngos.toLocaleString()}</div>
            <div className="stat-label">NGO Partners</div>
          </div>
          <div className="stat-root">
            <div className="stat-value">{stats.helped.toLocaleString()}+</div>
            <div className="stat-label">Lives Touched</div>
          </div>
          <div className="stat-root">
            <div className="stat-value">{stats.projects.toLocaleString()}+</div>
            <div className="stat-label">Projects</div>
          </div>
          <div className="stat-root">
            <div className="stat-value">{stats.volunteers.toLocaleString()}+</div>
            <div className="stat-label">Volunteers</div>
          </div>
        </div>
      </section>

      {/* Interactive Branches Section */}
      <section className="branches-section">
        <div className="container">
          <h2 className="section-title">
            <span className="title-icon">🌿</span>
            Our Branches of Support
          </h2>
          <p className="section-subtitle">Each branch represents a way we help communities grow</p>
          
          <div className="branches-tree">
            {branches.map((branch, index) => (
              <Link
                key={branch.id}
                to={branch.link}
                className={`branch ${hoveredBranch === branch.id ? 'branch-active' : ''}`}
                style={{ '--branch-delay': `${index * 0.1}s` }}
                onMouseEnter={() => setHoveredBranch(branch.id)}
                onMouseLeave={() => setHoveredBranch(null)}
              >
                <div className="branch-icon">{branch.icon}</div>
                <div className="branch-content">
                  <h3 className="branch-title">{branch.title}</h3>
                  <p className="branch-description">{branch.description}</p>
                  <div className="branch-arrow">→</div>
                </div>
                <div className="branch-line"></div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works - Tree Growth Metaphor */}
      <section className="how-it-works">
        <div className="container">
          <h2 className="section-title">
            <span className="title-icon">🌱</span>
            Watch Your Impact Grow
          </h2>
          <p className="section-subtitle">Like planting a seed, your contribution creates lasting change</p>
          
          <div className="growth-stages">
            <div className="growth-stage">
              <div className="stage-icon seed-stage">🌰</div>
              <div className="stage-content">
                <h3>1. Plant the Seed</h3>
                <p>Register and discover NGOs aligned with your values</p>
              </div>
            </div>
            
            <div className="growth-connector"></div>
            
            <div className="growth-stage">
              <div className="stage-icon sprout-stage">🌱</div>
              <div className="stage-content">
                <h3>2. Nurture & Connect</h3>
                <p>Donate, volunteer, or request support from NGOs</p>
              </div>
            </div>
            
            <div className="growth-connector"></div>
            
            <div className="growth-stage">
              <div className="stage-icon tree-stage">🌳</div>
              <div className="stage-content">
                <h3>3. See Impact Flourish</h3>
                <p>Track your contributions and watch communities thrive</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="features-garden">
        <div className="container">
          <h2 className="section-title">Cultivating Connections</h2>
          <div className="feature-grid">
            <div className="feature-leaf">
              <div className="leaf-icon">🗺️</div>
              <h3>Find Nearby NGOs</h3>
              <p>Discover organizations in your area with interactive map view</p>
            </div>
            <div className="feature-leaf">
              <div className="leaf-icon">💬</div>
              <h3>Real-time Chat</h3>
              <p>Connect directly with NGOs through instant messaging</p>
            </div>
            <div className="feature-leaf">
              <div className="leaf-icon">💝</div>
              <h3>Secure Donations</h3>
              <p>Contribute safely with transparent transaction tracking</p>
            </div>
            <div className="feature-leaf">
              <div className="leaf-icon">📊</div>
              <h3>Impact Dashboard</h3>
              <p>Monitor your contributions and community impact</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="final-cta">
        <div className="container">
          <div className="cta-content">
            <h2 className="cta-title">
              🌿 Join Our Growing Community
            </h2>
            <p className="cta-subtitle">
              Together, we can create a forest of positive change. Start your journey today.
            </p>
            {!isAuthenticated && (
              <div className="cta-actions">
                <Link to="/register" className="btn btn-cta-primary">
                  🌱 Start Growing Impact
                </Link>
                <Link to="/login" className="btn btn-cta-secondary">
                  Sign In
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
