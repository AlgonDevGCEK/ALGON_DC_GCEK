import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Undo2 ,X} from 'lucide-react';
import './RefundPolicy.css';

const RefundPolicy = () => {
  const navigate = useNavigate();

  // --- UNIVERSAL BACK BUTTON LOGIC ---
  const handleBack = () => {
    // Check if there is history to go back to
    if (window.history.length > 2) {
      navigate(-1); // Go back if history exists
    } else {
      window.close(); // Close tab if it's a new window
    }
  };
  return (
    <div className="policy-page-wrapper">
      <div className="policy-container">
        {/* Navigation Header */}
        <header className="policy-header">
          <button className="back-link" onClick={handleBack}>
             {/* Visual Trick: Show 'X' if it's likely a new tab, 'Arrow' if it's history */}
             {window.history.length > 2 ? (
                <><ArrowLeft size={18} /> Back</>
             ) : (
                <><X size={20} /> Close</>
             )}
          </button>
          <div className="header-info">
            <h1>Refund & Cancellation Policy <Undo2 size={28} color="#f59e0b" style={{ verticalAlign: 'middle', marginLeft: '10px' }} /></h1>
            <p>ALGON DC GCEK • Last updated: Dec 26, 2025</p>
          </div>
        </header>

        {/* Policy Content */}
        <div className="policy-body">
          <section>
            <h3>1. Membership Fees</h3>
            <p>Membership fees are collected solely for club registration and activities. Refunds for membership fees, if applicable, are decided by the ALGON DC GCEK program team based on the nature of the request and circumstances. Submission of a membership application does not automatically guarantee eligibility for a refund.</p>
          </section>

          <section>
            <h3>2. Refund Requests</h3>
            <p>Any refund request must be submitted through the <strong>Contact Us</strong> section of the website. The decision regarding approval or rejection of a refund request shall be final and at the discretion of the club.</p>
          </section>

          <section>
            <h3>3. Processing of Refunds</h3>
            <p>If a refund is approved, it will be processed through the original mode of payment, wherever possible. Processing time may vary depending on the payment method used and banking service providers.</p>
          </section>

          <section>
            <h3>4. Non-Refundable Cases</h3>
            <p>Membership fees may be non-refundable once club activities, benefits, or access have been provided. Furthermore, refunds will not be provided in cases of rule violations, misconduct, or termination of membership due to disciplinary reasons as outlined in our Terms & Conditions.</p>
          </section>

          <section>
            <h3>5. Changes to Refund Policy</h3>
            <p>ALGON DC GCEK reserves the right to modify or update this Refund Policy at any time. Any changes will be reflected on this page, and continued use of our services implies acceptance of the updated terms.</p>
          </section>

          <section>
            <h3>6. Contact</h3>
            <p>For refund-related queries or status updates on a request, please reach out through the <strong>Contact Us</strong> section available on the website or email us at <strong>adcgcek25@gmail.com</strong>.</p>
          </section>
        </div>

        <footer className="policy-footer">
          <p>© {new Date().getFullYear()} ALGON DC GCEK • Government College of Engineering Kannur</p>
        </footer>
      </div>
    </div>
  );
};

export default RefundPolicy;