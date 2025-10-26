import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getSiteContent } from '../services/api';
import { SiteContent } from '../types';

// Main Home Page Component
const HomePage: React.FC = () => {
  const [content, setContent] = useState<SiteContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
      const fetchContent = async () => {
          try {
              const data = await getSiteContent();
              setContent(data);
          } catch (error) {
              console.error("Failed to load site content", error);
          } finally {
              setIsLoading(false);
          }
      };
      fetchContent();
  }, []);

  if (isLoading) {
      return <div className="min-h-screen flex items-center justify-center text-white">Loading...</div>;
  }
  
  const heroVideo = content?.heroMedia.find(m => m.type === 'video');

  return (
    <div className="min-h-screen text-white font-sans">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-10 p-6 flex justify-between items-center bg-transparent">
        <h1 className="text-2xl font-bold text-cyan-400">Tuma-Africa Link Cargo</h1>
        <div>
          <Link to="/login" className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-6 rounded-full transition-colors">
            Login / Signup
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center text-center overflow-hidden">
        {content?.heroDisplayMode === 'video' && heroVideo && (
            <video autoPlay loop muted className="absolute z-0 w-auto min-w-full min-h-full max-w-none">
                <source src={heroVideo.url} type="video/mp4" />
                Your browser does not support the video tag.
            </video>
        )}
        {/* Note: Slideshow mode would require a carousel library, showing first image as placeholder */}
         {content?.heroDisplayMode === 'slideshow' && content.heroMedia.length > 0 && (
             <img src={content.heroMedia.find(m => m.type === 'image')?.url} alt="Hero" className="absolute z-0 w-full h-full object-cover" />
         )}

        <div className="absolute inset-0 bg-black opacity-60"></div>
        <div className="relative z-10 p-4">
          <h2 className="text-4xl md:text-6xl font-extrabold leading-tight mb-4">
            Order from all Chinese E-commerce Platforms Stress-Free
          </h2>
          <p className="text-xl md:text-2xl text-gray-300 mb-8">
            Only Link, We Handle The Rest. Africa Link Cargo — Smarter Shipping
          </p>
          <Link to="/login" className="bg-white text-gray-900 font-bold py-4 px-8 rounded-full text-lg hover:bg-gray-200 transition-transform transform hover:scale-105 inline-block">
            Tuma-Africa Link Cargo
          </Link>
        </div>
      </section>

      {/* Main Content Sections */}
      <main className="container mx-auto px-6 py-20 space-y-20">
        
        {/* About Us */}
        <section>
          <h3 className="text-3xl font-bold text-center mb-8">About Us</h3>
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <img src={content?.aboutUs.mediaUrl || "https://picsum.photos/seed/about/600/400"} alt="About Tuma-Africa" className="rounded-lg shadow-lg"/>
            <p className="text-gray-300 leading-relaxed">
              {content?.aboutUs.text}
            </p>
          </div>
        </section>

        {/* Our Companies */}
        {content && content.companies.length > 0 && (
            <section>
                <h3 className="text-3xl font-bold text-center mb-8">Our Partner Companies</h3>
                <div className="flex flex-wrap justify-center items-center gap-8">
                    {content.companies.map((company) => (
                    <a href={company.websiteUrl} key={company.id} target="_blank" rel="noopener noreferrer" className="opacity-70 hover:opacity-100 transition-opacity">
                        <img src={company.logoUrl} alt={company.name} className="h-12 object-contain" />
                    </a>
                    ))}
                </div>
            </section>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800/50 py-10 px-6 text-center">
          <div className="flex justify-center gap-6 mb-4">
              <a href={content?.socialLinks.facebook} className="text-gray-400 hover:text-white">Facebook</a>
              <a href={content?.socialLinks.twitter} className="text-gray-400 hover:text-white">Twitter</a>
              <a href={content?.socialLinks.instagram} className="text-gray-400 hover:text-white">Instagram</a>
          </div>
          <div className="space-x-4 text-sm text-gray-400">
              <a href="#" className="hover:text-white">Terms of Service</a>
              <span>|</span>
              <a href="#" className="hover:text-white">Privacy Policy</a>
          </div>
          <p className="mt-4 text-xs text-gray-500">&copy; 2024 Tuma-Africa Link Cargo. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default HomePage;