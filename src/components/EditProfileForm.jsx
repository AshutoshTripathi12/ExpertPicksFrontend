// src/components/EditProfileForm.jsx
import React, { useState, useEffect } from 'react';

const EditProfileForm = ({ currentUserProfile, onSave, onCancel, isLoading }) => {
  const [formData, setFormData] = useState({
    name: '',
    profilePhotoUrl: '',
    introduction: '',
    socialMediaLinks: '', // This will now be a multi-line string
    expertiseDescription: '',
    companyWebsite: '',
  });

  useEffect(() => {
    if (currentUserProfile) {
      setFormData({
        name: currentUserProfile.name || '',
        profilePhotoUrl: currentUserProfile.profilePhotoUrl || '',
        introduction: currentUserProfile.introduction || '',
        socialMediaLinks: currentUserProfile.socialMediaLinks || '',
        expertiseDescription: currentUserProfile.expertiseDescription || '',
        companyWebsite: currentUserProfile.companyWebsite || '',
      });
    }
  }, [currentUserProfile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Removed the JSON validation. We just pass the string data.
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-background p-6 md:p-8 shadow-lg rounded-lg border border-border-color">
      <h2 className="text-2xl font-semibold text-text-main border-b border-border-color pb-4 mb-6">Edit Your Profile</h2>
      
      {/* Name and Photo URL side-by-side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* ... (name input as before) ... */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-text-main">Name</label>
          <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} disabled={isLoading} className="mt-1 block w-full px-4 py-3 border border-border-color rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"/>
        </div>
        {/* ... (profilePhotoUrl input as before) ... */}
        <div>
          <label htmlFor="profilePhotoUrl" className="block text-sm font-medium text-text-main">Profile Photo URL</label>
          <input type="url" name="profilePhotoUrl" id="profilePhotoUrl" value={formData.profilePhotoUrl} onChange={handleChange} placeholder="https://example.com/your-photo.jpg" disabled={isLoading} className="mt-1 block w-full px-4 py-3 border border-border-color rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"/>
        </div>
      </div>

      {/* Introduction */}
      <div>
        <label htmlFor="introduction" className="block text-sm font-medium text-text-main">Introduction / Bio</label>
        <textarea name="introduction" id="introduction" rows="5" value={formData.introduction} onChange={handleChange} disabled={isLoading} className="mt-1 block w-full px-4 py-3 border border-border-color rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" placeholder="Tell everyone a little about yourself, your brand, or your expertise."/>
      </div>

      {/* Expertise and Website side-by-side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* ... (expertiseDescription input as before) ... */}
        <div>
            <label htmlFor="expertiseDescription" className="block text-sm font-medium text-text-main">Expertise Description</label>
            <input type="text" name="expertiseDescription" id="expertiseDescription" value={formData.expertiseDescription} onChange={handleChange} disabled={isLoading} placeholder="e.g., Professional Photographer, Sci-Fi Author" className="mt-1 block w-full px-4 py-3 border border-border-color rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"/>
        </div>
        {/* ... (companyWebsite input as before) ... */}
        <div>
            <label htmlFor="companyWebsite" className="block text-sm font-medium text-text-main">Website / Portfolio Link</label>
            <input type="url" name="companyWebsite" id="companyWebsite" value={formData.companyWebsite} onChange={handleChange} placeholder="https://your-brand.com" disabled={isLoading} className="mt-1 block w-full px-4 py-3 border border-border-color rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"/>
        </div>
      </div>

       {/* --- MODIFIED SOCIAL MEDIA LINKS FIELD --- */}
       <div>
        <label htmlFor="socialMediaLinks" className="block text-sm font-medium text-text-main">
          Social Media Links
        </label>
        <p className="text-xs text-text-muted mb-1">Enter each full link on a new line.</p>
        <textarea
          name="socialMediaLinks"
          id="socialMediaLinks"
          rows="4"
          value={formData.socialMediaLinks}
          onChange={handleChange}
          placeholder="https://twitter.com/yourhandle&#10;https://linkedin.com/in/yourprofile"
          className="mt-1 block w-full px-4 py-3 border border-border-color rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm font-mono"
          disabled={isLoading}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-4 pt-4 border-t border-border-color">
        <button type="button" onClick={onCancel} disabled={isLoading} className="px-6 py-2 text-sm font-semibold text-text-main bg-background border border-border-color rounded-md shadow-sm hover:bg-surface focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors">
          Cancel
        </button>
        <button type="submit" disabled={isLoading} className="px-6 py-2 text-sm font-semibold text-primary-text bg-primary border border-transparent rounded-md shadow-sm hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-70 disabled:cursor-not-allowed transition-colors">
          {isLoading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
};

export default EditProfileForm;