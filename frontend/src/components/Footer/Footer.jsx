import React from 'react'
import './Footer.css'
import { assets } from '../../assets/assets'

const Footer = () => {
  return (
    <div className='footer' id='footer'>
      <div className="footer-content">
        <div className="footer-content-left">
            <img src={assets.logo} alt="Tomato Logo" className="footer-logo" />
            <p>
              Craving something delicious? Tomato brings hot, fresh, and chef-crafted meals from the finest local kitchens directly to your doorstep in minutes.
            </p>
            <div className="footer-social-icons">
                <a href="https://facebook.com" target="_blank" rel="noreferrer">
                  <img src={assets.facebook_icon} alt="Facebook" />
                </a>
                <a href="https://twitter.com" target="_blank" rel="noreferrer">
                  <img src={assets.twitter_icon} alt="Twitter" />
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noreferrer">
                  <img src={assets.linkedin_icon} alt="LinkedIn" />
                </a>
            </div>
        </div>
        <div className="footer-content-center">
            <h2>COMPANY</h2>
            <ul>
                <li><a href="/">Home</a></li>
                <li><a href="#explore-menu">Explore Menu</a></li>
                <li><a href="#app-download">Mobile App</a></li>
                <li><a href="#footer">Privacy Policy</a></li>
            </ul>
        </div>
        <div className="footer-content-right">
            <h2>GET IN TOUCH</h2>
            <ul>
                <li>📞 +91 98765 43210</li>
                <li>✉️ support@tomato.com</li>
                <li>📍 Koramangala, Bengaluru, India</li>
            </ul>
        </div>
      </div>
      <hr />
      <p className="footer-copyright">Copyright 2026 © Tomato.com — Crafted for delightful food ordering.</p>
    </div>
  )
}

export default Footer
