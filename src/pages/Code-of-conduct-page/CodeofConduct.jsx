import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users } from 'lucide-react';
import './CodeOfConduct.css';

const CodeOfConduct = () => {
  const navigate = useNavigate();

  return (
    <div className="policy-page-wrapper">
      <div className="policy-container">
        {/* Navigation Header */}
        <header className="policy-header">
          <button className="back-link" onClick={() => navigate(-1)}>
            <ArrowLeft size={18} /> Back
          </button>
          <div className="header-info">
            <h1>Code of Conduct <Users size={28} color="#10b981" style={{ verticalAlign: 'middle', marginLeft: '10px' }} /></h1>
            <p>ALGON DC GCEK • Last updated: Dec 26, 2025</p>
          </div>
        </header>

        {/* Content Body */}
        <div className="policy-body">
          <section>
            <h3>1. Purpose</h3>
            <p>ALGON DC GCEK is committed to creating a respectful, inclusive, and collaborative environment that promotes learning, innovation, and ethical conduct. This Code of Conduct outlines the expected behavior of all members, participants, and contributors involved in club activities.</p>
          </section>

          <section>
            <h3>2. Community Values</h3>
            <p>All members are expected to uphold the following core values:</p>
            <ul className="policy-list">
              <li>Mutual respect towards fellow members, organizers, and participants</li>
              <li>Mutual learning and knowledge sharing</li>
              <li>Collaboration and teamwork</li>
              <li>Professional, ethical, and responsible behavior</li>
            </ul>
            <p>Discrimination, harassment, or disrespectful behavior in any form will not be tolerated.</p>
          </section>

          <section>
            <h3>3. Member Conduct</h3>
            <p>Members must treat everyone with dignity, maintain a positive attitude, and follow instructions provided by the Executive Committee (ExeCom). Members represent ALGON DC GCEK responsibly, both online and offline.</p>
          </section>

          <section>
            <h3>4. Academic Integrity & Fair Practices</h3>
            <p>Plagiarism and copying code without proper credit are strictly prohibited. Malpractices including impersonation, unfair collaboration, or manipulation of results are not permitted. Proper credit must be given to all external resources and libraries used.</p>
          </section>

          <section>
            <h3>5. Use of AI Tools</h3>
            <p>Use of AI tools is allowed only if explicitly permitted for the specific activity. If used, participants must disclose the usage and may be required to provide relevant prompts. Unauthorized use will be treated as a conduct violation.</p>
          </section>

          <section>
            <h3>6. Project & Event Submissions</h3>
            <p>All projects must be submitted within the prescribed timeline. Late submissions may not be accepted. Each participant or team is responsible for ensuring the originality and timely completion of their work.</p>
          </section>

          <section>
            <h3>7. Fair Evaluation & Governance</h3>
            <p>ALGON DC GCEK follows a strict no-nepotism and no-favoritism policy. Decisions regarding evaluations and rankings are made fairly and transparently. Attempting to influence results through personal connections is strictly prohibited.</p>
          </section>

          <section>
            <h3>8. Certificates & Recognition</h3>
            <p>Certificates are issued by the ExeCom based on predefined criteria such as performance or completion. The ExeCom’s decision regarding certification is final.</p>
          </section>

          <section>
            <h3>9. Violations & Disciplinary Action</h3>
            <div className="danger-zone">
              <p><strong>Consequences of violations include:</strong> Warnings, disqualification from events, cancellation of membership, denial of certificates, or a permanent ban from the club.</p>
            </div>
          </section>

          <section>
            <h3>10. Amendments</h3>
            <p>ALGON DC GCEK reserves the right to update this Code of Conduct at any time. Members are expected to comply with the most recent version reflected on this page.</p>
          </section>

          <section>
            <h3>11. Contact</h3>
            <p>For questions or reports related to conduct, please reach out through the <strong>Contact Us</strong> section of the website.</p>
          </section>
        </div>

        <footer className="policy-footer">
          <p>© {new Date().getFullYear()} ALGON DC GCEK • Government College of Engineering Kannur</p>
        </footer>
      </div>
    </div>
  );
};

export default CodeOfConduct;