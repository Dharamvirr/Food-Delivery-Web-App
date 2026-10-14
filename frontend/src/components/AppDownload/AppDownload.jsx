import React from 'react';
import './AppDownload.css';
import { assets } from '../../assets/assets';

const AppDownload = () => {
  return (
    <div className='app-download' id='app-download'>
      <div className="app-download-inner">
        <span className="app-download-badge">📱 Mobile Experience</span>
        <h2>For a Seamless Food Experience, Download Tomato App</h2>
        <p>Get exclusive app-only discounts, real-time live GPS order tracking, and faster checkout at your fingertips.</p>
        
        <div className="app-download-platforms">
          <a href="https://play.google.com" target="_blank" rel="noreferrer" title="Download on Google Play">
            <img src={assets.play_store} alt="Google Play Store" />
          </a>
          <a href="https://apple.com/app-store" target="_blank" rel="noreferrer" title="Download on App Store">
            <img src={assets.app_store} alt="Apple App Store" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default AppDownload;
