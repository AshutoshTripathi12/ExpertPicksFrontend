import React, { useState, useEffect } from 'react';
import Button from './Button'; // Import our new Button component

const EditProfileForm = ({ currentUserProfile, onSave, onCancel, isLoading }) => {
  // We'll manage social links as separate properties in an object
  const [formData, setFormData] = useState({
    name: '',
    profilePhotoUrl: '',
    introduction: '',
    expertiseDescription: '',
    companyWebsite: '',
    socials: {
      twitter: '',
      linkedin: '',
      instagram: '',
      github: ''
    }
  });

  // When the component loads, parse the existing socialMediaLinks string (if it exists)
  useEffect(() => {
    if (currentUserProfile) {
      let socialLinks = { twitter: '', linkedin: '', instagram: '', github: '' };
      if (currentUserProfile.socialMediaLinks) {
        try {
          // Try to parse as JSON first (our new format)
          const parsedLinks = JSON.parse(currentUserProfile.socialMediaLinks);
          if (typeof parsedLinks === 'object' && parsedLinks !== null) {
            socialLinks = { ...socialLinks, ...parsedLinks };
          }
        } catch (e) {
          // Fallback for old data: if it's not JSON, we assume it's the old newline format
          // This part is for backward compatibility; you can remove it later.
          const links = currentUserProfile.socialMediaLinks.split('\n');
          socialLinks.twitter = links.find(l => l.includes('twitter.com')) || '';
          socialLinks.linkedin = links.find(l => l.includes('linkedin.com')) || '';
          socialLinks.instagram = links.find(l => l.includes('instagram.com')) || '';
          socialLinks.github = links.find(l => l.includes('github.com')) || '';
        }
      }

      setFormData({
        name: currentUserProfile.name || '',
        profilePhotoUrl: currentUserProfile.profilePhotoUrl || '',
        introduction: currentUserProfile.introduction || '',
        expertiseDescription: currentUserProfile.expertiseDescription || '',
        companyWebsite: currentUserProfile.companyWebsite || '',
        socials: socialLinks
      });
    }
  }, [currentUserProfile]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSocialChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      socials: {
        ...prev.socials,
        [name]: value
      }
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Before saving, combine the social links back into a single JSON string
    const profileDataToSave = {
      ...formData,
      socialMediaLinks: JSON.stringify(formData.socials)
    };
    delete profileDataToSave.socials; // Don't send the 'socials' object itself
    onSave(profileDataToSave);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-background p-6 md:p-8 shadow-lg rounded-lg border border-border-color">
      <h2 className="text-2xl font-semibold text-text-main border-b border-border-color pb-4 mb-6">Edit Your Profile</h2>
      
      {/* Name and Photo URL */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-text-main">Name</label>
          <input type="text" name="name" id="name" value={formData.name} onChange={handleFormChange} disabled={isLoading} className="mt-1 block w-full px-4 py-3 border border-border-color rounded-md shadow-sm"/>
        </div>
        <div>
          <label htmlFor="profilePhotoUrl" className="block text-sm font-medium text-text-main">Profile Photo URL</label>
          <input type="url" name="profilePhotoUrl" id="profilePhotoUrl" value={formData.profilePhotoUrl} onChange={handleFormChange} placeholder="https://example.com/your-photo.jpg" disabled={isLoading} className="mt-1 block w-full px-4 py-3 border border-border-color rounded-md shadow-sm"/>
        </div>
      </div>

      {/* Introduction */}
      <div>
        <label htmlFor="introduction" className="block text-sm font-medium text-text-main">Introduction / Bio</label>
        <textarea name="introduction" id="introduction" rows="5" value={formData.introduction} onChange={handleFormChange} disabled={isLoading} className="mt-1 block w-full px-4 py-3 border border-border-color rounded-md shadow-sm" placeholder="Tell everyone a little about yourself..."/>
      </div>
      
      {/* Expertise and Website */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="expertiseDescription" className="block text-sm font-medium text-text-main">Expertise Description</label>
          <input type="text" name="expertiseDescription" id="expertiseDescription" value={formData.expertiseDescription} onChange={handleFormChange} disabled={isLoading} placeholder="e.g., Professional Photographer" className="mt-1 block w-full px-4 py-3 border border-border-color rounded-md shadow-sm"/>
        </div>
        <div>
          <label htmlFor="companyWebsite" className="block text-sm font-medium text-text-main">Website / Portfolio Link</label>
          <input type="url" name="companyWebsite" id="companyWebsite" value={formData.companyWebsite} onChange={handleFormChange} placeholder="https://your-brand.com" disabled={isLoading} className="mt-1 block w-full px-4 py-3 border border-border-color rounded-md shadow-sm"/>
        </div>
      </div>

       {/* --- NEW DEDICATED SOCIAL MEDIA INPUTS --- */}
       <div className="pt-4 border-t border-border-color">
         <h3 className="text-lg font-medium text-text-main">Social Links</h3>
         <p className="text-sm text-text-muted mb-4">Add your full profile URLs.</p>
         <div className="space-y-4">
            <div>
              <label htmlFor="twitter" className="block text-sm font-medium text-text-main">Twitter</label>
              <input type="url" name="twitter" id="twitter" value={formData.socials.twitter} onChange={handleSocialChange} placeholder="https://twitter.com/yourhandle" disabled={isLoading} className="mt-1 block w-full px-4 py-3 border border-border-color rounded-md shadow-sm"/>
            </div>
            <div>
              <label htmlFor="linkedin" className="block text-sm font-medium text-text-main">LinkedIn</label>
              <input type="url" name="linkedin" id="linkedin" value={formData.socials.linkedin} onChange={handleSocialChange} placeholder="https://linkedin.com/in/yourprofile" disabled={isLoading} className="mt-1 block w-full px-4 py-3 border border-border-color rounded-md shadow-sm"/>
            </div>
            <div>
              <label htmlFor="instagram" className="block text-sm font-medium text-text-main">Instagram</label>
              <input type="url" name="instagram" id="instagram" value={formData.socials.instagram} onChange={handleSocialChange} placeholder="https://instagram.com/yourhandle" disabled={isLoading} className="mt-1 block w-full px-4 py-3 border border-border-color rounded-md shadow-sm"/>
            </div>
            <div>
              <label htmlFor="github" className="block text-sm font-medium text-text-main">GitHub</label>
              <input type="url" name="github" id="github" value={formData.socials.github} onChange={handleSocialChange} placeholder="https://github.com/yourhandle" disabled={isLoading} className="mt-1 block w-full px-4 py-3 border border-border-color rounded-md shadow-sm"/>
            </div>
         </div>
       </div>

      {/* Action Buttons */}
 <div className="flex justify-end space-x-4 pt-6 border-t border-border-color">
        <Button
          type="button"
          variant="secondary" // Use the secondary style
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary" // Use the primary style
          disabled={isLoading}
        >
          {isLoading ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </form>
  );
};

export default EditProfileForm;