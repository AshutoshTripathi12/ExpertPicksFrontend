// src/pages/PrivacyPolicyPage.jsx
import React from 'react';

const PrivacyPolicyPage = () => {
    return (
        <div className="bg-background py-8 md:py-12">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                {/* Use the Tailwind Typography plugin for beautiful text styling */}
                <div className="prose prose-lg max-w-4xl mx-auto">
                    <h1>Privacy Policy for ExpertPicks</h1>
                    <p className="lead">Last updated: June 15, 2025</p>
                    
                    <p>
                        Welcome to ExpertPicks. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website. Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the site.
                    </p>

                    <h2>Collection of Your Information</h2>
                    <p>
                        We may collect information about you in a variety of ways. The information we may collect on the Site includes personally identifiable information, such as your name, email address, and demographic information, that you voluntarily give to us when you register with the Site or when you choose to participate in various activities related to the Site.
                    </p>
                    
                    <h3>Derivative Data</h3>
                    <p>
                        Information our servers automatically collect when you access the Site, such as your IP address, your browser type, your operating system, your access times, and the pages you have viewed directly before and after accessing the Site.
                    </p>

                    <h2>Use of Your Information</h2>
                    <p>
                        Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the Site to:
                    </p>
                    <ul>
                        <li>Create and manage your account.</li>
                        <li>Email you regarding your account or order.</li>
                        <li>Enable user-to-user communications.</li>
                        <li>Increase the efficiency and operation of the Site.</li>
                        <li>Monitor and analyze usage and trends to improve your experience with the Site.</li>
                    </ul>

                    <h2>Security of Your Information</h2>
                    <p>
                        We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.
                    </p>
                    
                    <h2>Contact Us</h2>
                    <p>
                        If you have questions or comments about this Privacy Policy, please contact us at: ashutoshtripathisf@gmail.com
                    </p>

                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicyPage;