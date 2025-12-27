import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShieldCheck , X } from 'lucide-react';
import './PrivacyPolicy.css';

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (window.history.length > 2) {
      navigate(-1); 
    } else {
      window.close(); 
    }
  };

  return (
    <div className="privacy-page-wrapper">
      <div className="privacy-container">
        {/* Navigation Header */}
        <header className="privacy-header">
          <button className="back-link" onClick={handleBack}>
             {/* Visual Trick: Show 'X' if it's likely a new tab, 'Arrow' if it's history */}
             {window.history.length > 2 ? (
                <><ArrowLeft size={18} /> Back</>
             ) : (
                <><X size={20} /> Close</>
             )}
          </button>
          <div className="header-info">
            <div>
                <h1>Privacy Policy &nbsp;<ShieldCheck size={28} color="#34d399" /></h1>
                
            </div>
            <p>ALGON DC GCEK • Last updated: December 26, 2025</p>
          </div>
        </header>

        {/* Policy Content */}
        <div className="privacy-body">
          <section>
            <h3>1. Introduction</h3>
            <p>ALGON DC GCEK respects the privacy of its members and users. This Privacy Policy explains how we collect, use, store, and protect personal information provided through our website and services. By using this website, you agree to the practices described in this policy.</p>
          </section>

          <section>
            <h3>2. Information We Collect</h3>
            <p>We collect only the data necessary for club membership and event participation, including:</p>
            <ul>
              <li>Full name</li>
              <li>Email address</li>
              <li>Phone number</li>
              <li>Department and year of study</li>
              <li>Membership and event registration details</li>
            </ul>
            <div className="optional-info-box">
              <p><strong>Optional Information - Profile Picture:</strong> Users may optionally upload a profile picture for the purpose of generating a digital or physical club ID card. This is completely optional and based on the user’s choice.</p>
            </div>
          </section>

          <section>
            <h3>3. Passwords & Authentication</h3>
            <p>User passwords are securely encrypted and managed through a secure authentication system. Passwords are not visible or accessible to club administrators. ALGON DC GCEK does not store passwords in plain text.</p>
          </section>

          <section>
            <h3>4. How We Use Your Information</h3>
            <p>Collected data is used strictly for:</p>
            <ul>
                <li>Managing club membership and profiles</li>
                <li>Event registrations and participation</li>
                <li>Generating club ID cards (if applicable)</li>
                <li>Internal communication related to club activities</li>
                <li>Administrative and record-keeping purposes</li>
            </ul>
            <p><em>Your data will not be used for marketing or commercial purposes.</em></p>
          </section>

          <section>
            <h3>5. Data Storage & Security</h3>
            <p>All user data is stored securely using cloud-based backend services. Access to personal data is restricted to authorized administrators only. Reasonable technical and organizational measures are implemented to protect data from unauthorized access, misuse, or loss.</p>
          </section>

          <section>
            <h3>6. Data Sharing</h3>
            <p>ALGON DC GCEK does not sell, rent, or share personal data with third parties. Personal information may be disclosed only if required by law or by institutional authority.</p>
          </section>

          <section>
            <h3>7. Payments & Financial Information</h3>
            <p>Payments (if applicable) are handled through external payment methods. ALGON DC GCEK does not store payment card, UPI, or banking details on its servers.</p>
          </section>

          <section>
            <h3>8. Data Retention</h3>
            <p>Personal data is retained only for as long as necessary for club operations. Users may request correction or deletion of their data by contacting the club, subject to club policies and record requirements.</p>
          </section>

          <section>
            <h3>9. User Rights</h3>
            <p>Users have the right to access their personal data, request correction of inaccurate or outdated information, and request deletion of their account or personal data.</p>
          </section>

          <section>
            <h3>10. Changes to This Privacy Policy</h3>
            <p>This Privacy Policy may be updated periodically. Any changes will be reflected on this page, and continued use of the website implies acceptance of the updated policy.</p>
          </section>

          <section>
            <h3>11. Contact</h3>
            <p>For any privacy-related questions or concerns, please reach out through the <strong>Contact Us</strong> section available on the website.</p>
          </section>
        </div>

        <footer className="privacy-footer">
          <p>© {new Date().getFullYear()} ALGON DC GCEK • Government College of Engineering Kannur</p>
        </footer>
      </div>
    </div>
  );
};

export default PrivacyPolicy;