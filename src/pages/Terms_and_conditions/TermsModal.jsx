import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';
import './TermsModal.css';

const TermsModal = () => {
  const navigate = useNavigate();

  const handleBackClick = () => {
    // Navigate back to JoinInfo with hash
    navigate('/join-us#policy-review', { replace: false });
  };

  return (
    <div className="terms-page-wrapper">
      <div className="terms-container">
        {/* Navigation Header */}
        <header className="terms-header">
          <button className="back-link" onClick={handleBackClick}>
            <ArrowLeft size={18} /> Back
          </button>
          <div className="header-info">
            <h1>Terms & Conditions <FileText size={28} color="#3b82f6" /></h1>
            <p>ALGON DC GCEK • Last updated: Dec 26, 2025</p>
          </div>
        </header>

        {/* Legal Content */}
        <div className="terms-body">
          <section>
            <h3>1. Acceptance of Terms</h3>
            <p>By accessing or using the ALGON DC GCEK website and its services, you agree to comply with and be bound by these Terms & Conditions. If you do not agree with any part of these terms, please do not use the website.</p>
          </section>

          <section>
            <h3>2. Eligibility</h3>
            <p>Membership is strictly open only to students of Government College of Engineering Kannur. Users must provide accurate, complete, and truthful information during registration. Providing false or misleading information may result in rejection or cancellation of membership.</p>
          </section>

          <section>
            <h3>3. Membership & Registration</h3>
            <p>Membership registration requires submission of personal details and payment of the applicable membership fee. The club reserves the right to approve, reject, suspend, or revoke membership in case of misuse, violation of rules, or misconduct.</p>
          </section>

          <section>
            <h3>4. Events & Programs</h3>
            <p>Event details, schedules, and availability are subject to change. Registration for an event does not guarantee participation unless explicitly confirmed by the club. The club's decision regarding event conduct shall be final.</p>
          </section>

          <section>
            <h3>5. Payments</h3>
            <p>Membership and event fees are collected through direct payment methods, including QR-based payments. Users are responsible for ensuring that payments are made correctly. ALGON DC GCEK does not store your banking, UPI, or card details on its servers.</p>
          </section>

          <section>
            <h3>6. User Responsibilities</h3>
            <p>Users agree to use the platform for intended purposes and maintain professional conduct. Unauthorized access to admin features or backend systems is strictly prohibited.</p>
            <div className="danger-zone">
              <p><strong>⚠ Warning:</strong> Harassment, discrimination, abuse, unethical hacking, exploitation of vulnerabilities, or any malicious activity will result in immediate termination of membership and access without refund.</p>
            </div>
          </section>

          <section>
            <h3>7. Intellectual Property</h3>
            <p>All website content is property of ALGON DC GCEK. Participants retain ownership of the code and projects they create, but grant the club the right to showcase such projects with proper credit for promotional purposes.</p>
          </section>

          <section>
            <h3>8. Limitation of Liability</h3>
            <p>ALGON DC GCEK shall not be held responsible for temporary downtime, technical bugs, or issues caused by third-party hosting or payment providers.</p>
          </section>

          <section>
            <h3>9. Changes to Terms</h3>
            <p>The club reserves the right to update these terms at any time. Continued use of the website after changes implies acceptance of the updated terms.</p>
          </section>

          <section>
            <h3>10. Contact</h3>
            <p>For any questions or grievances regarding these terms, please reach out through the Contact Us section on the website or email us at <strong>adcgcek25@gmail.com</strong>.</p>
          </section>
        </div>

        <footer className="terms-footer">
          <p>© {new Date().getFullYear()} ALGON DC GCEK • Government College of Engineering Kannur</p>
        </footer>
      </div>
    </div>
  );
};

export default TermsModal;