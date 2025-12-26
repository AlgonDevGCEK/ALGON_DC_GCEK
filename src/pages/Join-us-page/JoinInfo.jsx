import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Rocket, Users, Zap, Award, ArrowRight, ShieldAlert, Loader2, CheckCircle2 , Github ,Crown,Globe,TrendingUp } from 'lucide-react';
import { supabase } from '../../supabaseClient'; 
import './JoinInfo.css';

const JoinInfo = () => {
  const navigate = useNavigate();
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch ALL membership options
  useEffect(() => {
    const fetchFees = async () => {
      try {
        const { data, error } = await supabase
          .from('membership_fees')
          .select('*')
          .order('amount', { ascending: true }); // Sort by price 

        if (error) throw error;
        setFees(data || []);
      } catch (error) {
        console.error('Error fetching fees:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFees();
  }, []);

  return (
    <div className="join-info-wrapper">
      <div className="join-content">
        
        {/* 1. Hero Section */}
        <section className="join-hero animate-fade-in">
          <h1>Start Your Journey with </h1>
          <div className='logo-heading'>
          <h1><span className="highlight">ALGON DC</span></h1>
          <h1><span className="highlight">GCEK</span></h1>
          </div>
          
          <p>Join the community of innovators, developers, and future tech leaders at GCEK.</p>
        </section>

        {/* 2. Why Join Us? (Benefits) */}
        <section className="benefits-grid">
          <div className="benefit-card delay-5">
            <div className="icon-box blue"><Rocket size={28} /></div>
            <h3>Projects & Hackathons</h3>
            <p>Participate in exclusive events like InsightX and build real-world projects for your portfolio.</p>
          </div>
          <div className="benefit-card delay-5">
            <div className="icon-box green"><Users size={28} /></div>
            <h3>Mentorship</h3>
            <p>Get guidance from seniors and industry experts to accelerate your learning curve.</p>
          </div>
          <div className="benefit-card delay-5">
            <div className="icon-box amber"><Zap size={28} /></div>
            <h3>Skill Development</h3>
            <p>Access workshops on AI, Web Dev, Cloud, and more. Learn by doing.</p>
          </div>
          <div className="benefit-card delay-5">
            <div className="icon-box pink"><Award size={28} /></div>
            <h3>Certification</h3>
            <p>Earn certificates for active participation and project completion to boost your resume.</p>
          </div>
        </section>

        {/* 3. Membership Fee Table */}
        <section className="fee-section animate-slide-up">
          <h2>Membership Plans</h2>
          <p className="section-subtitle">Choose the plan that fits your academic journey</p>
          
          <div className="fee-grid-container">
            {loading ? (
              <div className="loading-state">
                <Loader2 className="spinner" size={40} color="#3b82f6" />
                <p>Loading plans...</p>
              </div>
            ) : (
              fees.map((plan) => (
                <div key={plan.id} className="fee-plan-card">
                  <div className="plan-header">
                    <h3>{plan.label}</h3>
                    <div className="price-tag">
                      <span className="currency">₹</span>
                      <span className="amount">{plan.amount}</span>
                    </div>
                    <p className="plan-duration">{plan.years} Year Validity</p>
                  </div>
                  
                  <div className="plan-features">
                    <ul>
                      <li><CheckCircle2 size={16} color="#10b981" /> Full Access to Workshops</li>
                      <li><CheckCircle2 size={16} color="#10b981" /> ID Card Included</li>
                      <li><CheckCircle2 size={16} color="#10b981" /> Certifications</li>
                      <li><CheckCircle2 size={16} color="#10b981" /> Community Support</li>
                    </ul>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* 4. Policy Review (Updated Navigation) */}
        <section className="policy-review animate-slide-up">
          <div className="policy-alert">
            <h1><ShieldAlert size={60} color="#1ae917ff" /></h1>
            <h3>Before you register, please review our community guidelines.</h3>
          </div>
          <p>We value transparency. Please read the policies below to understand your rights and responsibilities.</p>
          
          <div className="policy-links">
            {/* Updated to use navigate() instead of anchor tags */}
            <button onClick={() => navigate('/terms-and-conditions')} className="policy-btn">Terms & Conditions</button>
            <button onClick={() => navigate('/privacy-policy')} className="policy-btn">Privacy Policy</button>
            <button onClick={() => navigate('/refund-policy')} className="policy-btn">Refund Policy</button>
            <button onClick={() => navigate('/code-of-conduct')} className="policy-btn">Code of Conduct</button>
          </div>
        </section>

        {/* 5. The "Proceed" CTA */}
        <div className="action-area animate-slide-up">
          <button className="proceed-btn" onClick={() => navigate('/signup')}>
            Proceed to Registration <ArrowRight size={20} />
          </button>
          <p className="disclaimer">By clicking Proceed, you acknowledge that you have access to read the policies above.</p>
        </div>

      </div>
    </div>
  );
};

export default JoinInfo;