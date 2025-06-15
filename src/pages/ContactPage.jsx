// src/pages/ContactPage.jsx
import React, { useState } from 'react';
import Button from '../components/Button';

const ContactPage = () => {
  // IMPORTANT: Replace this with your own Formspree endpoint URL
  const FORMSPREE_ENDPOINT = 'https://formspree.io/f/mwpbbbpd';

  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        headers: {
          'Accept': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setSuccess(true);
        setFormData({ name: '', email: '', message: '' }); // Clear form on success
      } else {
        const responseData = await response.json();
        if (responseData.errors) {
          setError(responseData.errors.map(err => err.message).join(', '));
        } else {
          setError('An unexpected error occurred. Please try again.');
        }
      }
    } catch (err) {
      setError('Failed to send message. Please check your connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-background py-8 md:py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-12 md:mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-text-main tracking-tight">Get In Touch</h1>
          <p className="mt-4 text-lg text-text-muted">
            Have questions or want to partner with us? We'd love to hear from you.
          </p>
        </div>

        <div className="max-w-xl mx-auto bg-white p-8 rounded-lg shadow-lg border border-border-color">
          {success ? (
            <div className="text-center py-10">
              <svg className="mx-auto h-16 w-16 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="mt-4 text-2xl font-semibold text-text-main">Thank You!</h3>
              <p className="mt-2 text-text-muted">Your message has been sent successfully. We'll get back to you soon.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-text-main">Full Name</label>
                <input type="text" name="name" id="name" required value={formData.name} onChange={handleChange} disabled={isSubmitting} className="mt-1 block w-full px-4 py-3 border border-border-color rounded-md shadow-sm"/>
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-text-main">Your Email</label>
                <input type="email" name="email" id="email" required value={formData.email} onChange={handleChange} disabled={isSubmitting} className="mt-1 block w-full px-4 py-3 border border-border-color rounded-md shadow-sm"/>
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-text-main">Message</label>
                <textarea name="message" id="message" rows="5" required value={formData.message} onChange={handleChange} disabled={isSubmitting} className="mt-1 block w-full px-4 py-3 border border-border-color rounded-md shadow-sm"/>
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <div>
                <Button type="submit" variant="primary" disabled={isSubmitting} className="w-full">
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactPage;