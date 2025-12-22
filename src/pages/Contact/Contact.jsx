import React, { useRef, useState } from 'react'; // Imports must be at the top
import emailjs from '@emailjs/browser';
import './Contact.css';

const Contact = () => {
  const form = useRef();
  
  // Status must be INSIDE the component function
  const [status, setStatus] = useState(''); 

  const sendEmail = (e) => {
    e.preventDefault();
    setStatus('sending'); 
   
    emailjs
      .sendForm('service_z4zrlqk', 'template_mmlgczt', form.current, {
        publicKey: '51-aOGo6wqf0TGYvW',
      })
      .then(
        () => {
          setStatus('success');
          e.target.reset(); 
          setTimeout(() => setStatus(''), 5000);
        },
        (error) => {
          setStatus('error');
          console.error('EmailJS Error:', error);
        }
      );
  };

  return (
    <div className="contact-section">
      <div className="contact-header">
        <br /><br /><br />
        <h1>Get In Touch</h1>
        <p>
          Have questions? We'd love to hear from you. Send us a message and we'll
          respond as soon as possible.
        </p>
      </div>

      <div className="contact-container">
        <div className="contact-info">
          <div className="info-card">
            <div className="icon-wrapper">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="icon">
                <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
              </svg>
            </div>
            <h3>Address</h3>
            <p>
              Government College of Engineering Kannur,<br />
              Mangattuparamba, Kannur, Kerala - 670563
            </p>
          </div>

          <div className="info-card">
            <div className="icon-wrapper">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="icon">
                <path d="M1.5 8.67v8.58a3 3 0 003 3h15a3 3 0 003-3V8.67l-8.928 5.493a3 3 0 01-3.144 0L1.5 8.67z" />
                <path d="M22.5 6.908V6.75a3 3 0 00-3-3h-15a3 3 0 00-3 3v.158l9.714 5.978a1.5 1.5 0 001.572 0L22.5 6.908z" />
              </svg>
            </div>
            <h3>Email</h3>
            <p>contact@algondc.org</p>
          </div>
        </div>

        <div className="contact-form-wrapper">
          <h2>Send Us a Message</h2>

          {status === 'success' && (
            <div className="status-message success">
              ✅ Message sent! We'll get back to you soon.
            </div>
          )}
          {status === 'error' && (
            <div className="status-message error">
              ❌ Something went wrong. Please try again.
            </div>
          )}

          <form ref={form} onSubmit={sendEmail} className="contact-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">Name *</label>
                <input type="text" name="user_name" id="name" placeholder="Your name" required />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email *</label>
                <input type="email" name="user_email" id="email" placeholder="your.email@example.com" required />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="subject">Subject</label>
              <input type="text" name="subject" id="subject" placeholder="What is this about?" />
            </div>

            <div className="form-group">
              <label htmlFor="message">Message *</label>
              <textarea name="message" id="message" rows="5" placeholder="Your message..." required></textarea>
            </div>

            <button 
              type="submit" 
              className={`submit-btn ${status === 'sending' ? 'loading' : ''}`}
              disabled={status === 'sending' || status === 'success'}
            >
              {status === 'sending' ? "Sending..." : 
               status === 'success' ? "Sent Successfully! ✅" : 
               "Send Message"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;