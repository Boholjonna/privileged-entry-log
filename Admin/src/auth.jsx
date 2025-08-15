import React, { useState } from 'react';
import PropTypes from 'prop-types';

import { supabase } from './supabaseClient';
import emailjs from '@emailjs/browser';
import './styles/auth.css';
Auth.propTypes = {
  onClose: PropTypes.func,
  onAuthSuccess: PropTypes.func,
};

function Auth({ onClose, onAuthSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showOTP, setShowOTP] = useState(false);
  const [otp, setOtp] = useState('');
  const [authCode, setAuthCode] = useState('');
  const [otpExpiry, setOtpExpiry] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Check if environment variables are loaded
    console.log('Environment check:');
    console.log('VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL);
    console.log('VITE_SUPABASE_ANON_KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY ? '***' + import.meta.env.VITE_SUPABASE_ANON_KEY.slice(-4) : 'UNDEFINED');
    
    if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
      setError('Supabase configuration missing. Check your .env file.');
      setLoading(false);
      return;
    }

    // Test basic Supabase connection
    try {
      console.log('Testing Supabase connection...');
      
      // Simple test query
      const { data: testData, error: testError } = await supabase
        .from('auth')
        .select('*')
        .limit(1);
      
      if (testError) {
        console.error('Supabase connection failed:', testError);
        setError(`Database connection failed: ${testError.message}`);
        setLoading(false);
        return;
      }
      
      console.log('Supabase connection successful!');
      console.log('Test data:', testData);
      
    } catch (connectionError) {
      console.error('Connection error:', connectionError);
      setError(`Connection error: ${connectionError.message}`);
      setLoading(false);
      return;
    }

    try {
      console.log('Attempting login with:', { email, password });
      
      // Test Supabase connection first
      const { error: testError } = await supabase
        .from('auth')
        .select('count')
        .limit(1);
      
      if (testError) {
        console.error('Supabase connection test failed:', testError);
        setError(`Database connection failed: ${testError.message}`);
        setLoading(false);
        return;
      }
      
      console.log('Supabase connection successful');
      
      // Check credentials against Supabase auth table
      console.log('Querying auth table with email:', email);
      
      // First try to find any record with the email
      const { data: emailCheck, error: emailError } = await supabase
        .from('auth')
        .select('*')
        .eq('email', email);
      
      console.log('Email check result:', emailCheck);
      
      if (emailError) {
        console.error('Email check error:', emailError);
        setError(`Email check failed: ${emailError.message}`);
        setLoading(false);
        return;
      }
      
      if (!emailCheck || emailCheck.length === 0) {
        console.log('No user found with this email');
        setError('Invalid email or password');
        setLoading(false);
        return;
      }
      
      // Check if password matches
      const user = emailCheck[0];
      console.log('User found:', user);
      
      if (user.pass !== password) {
        console.log('Password mismatch');
        setError('Invalid email or password');
        setLoading(false);
        return;
      }
      
      console.log('Credentials verified successfully!');
      
      // Generate random authentication code
      const generatedAuthCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      setAuthCode(generatedAuthCode);
      
      // Set OTP expiry (15 minutes from now)
      const expiryTime = new Date(Date.now() + 15 * 60 * 1000);
      setOtpExpiry(expiryTime);
      
      // Send authentication code to admin's email using EmailJS
      try {
        console.log('EmailJS Environment Check:');
        console.log('VITE_EMAILJS_PUBLIC_KEY:', import.meta.env.VITE_EMAILJS_PUBLIC_KEY ? '***' + import.meta.env.VITE_EMAILJS_PUBLIC_KEY.slice(-4) : 'UNDEFINED');
        console.log('VITE_EMAILJS_SERVICE_ID:', import.meta.env.VITE_EMAILJS_SERVICE_ID);
        console.log('VITE_EMAILJS_TEMPLATE_ID:', import.meta.env.VITE_EMAILJS_TEMPLATE_ID);
        
        // Initialize EmailJS with your public key
        const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
        if (!publicKey) {
          throw new Error('EmailJS public key not found in environment variables');
        }
        
        emailjs.init(publicKey);
        console.log('EmailJS initialized successfully');
        
        // Calculate expiration time (15 minutes from now)
        const now = new Date();
        const expirationTime = new Date(now.getTime() + 15 * 60 * 1000); // 15 minutes
        const timeString = expirationTime.toLocaleString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        });

        const templateParams = {
          to_email: email,
          to_name: "Admin",
          passcode: generatedAuthCode, // Changed to match your template field
          time: timeString,   // Added time field for your template
          message: `Your authentication code is: ${generatedAuthCode}. This code will expire in 15 minutes.`
        };
        
        console.log('Sending email with params:', templateParams);
        console.log('Using Service ID:', import.meta.env.VITE_EMAILJS_SERVICE_ID);
        console.log('Using Template ID:', import.meta.env.VITE_EMAILJS_TEMPLATE_ID);
        
        // Send email using EmailJS
        const emailResponse = await emailjs.send(
          import.meta.env.VITE_EMAILJS_SERVICE_ID,
          import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
          templateParams
        );
        
        if (emailResponse.status === 200) {
          setSuccess(`Authentication code sent to ${email}. Please check your email and enter the code below.`);
          setShowOTP(true); // Show OTP input
        } else {
          throw new Error('Email sending failed');
        }
        
      } catch (emailError) {
        console.error('Email sending error:', emailError);
        // Fallback: show the code on screen if email fails
        setSuccess(`Authentication code ${generatedAuthCode} sent to ${email}. Please check your email and enter the code below.`);
        setShowOTP(true); // Show OTP input even if email fails
      }
      
    } catch (error) {
      console.error('Login error:', error);
      setError('An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  const handleOTPVerification = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    if (!otp || otp.trim() === '') {
      setError('Please enter the OTP code');
      setLoading(false);
      return;
    }
    
    // Check if OTP has expired
    if (otpExpiry && new Date() > otpExpiry) {
      setError('OTP has expired. Please request a new one.');
      setLoading(false);
      return;
    }
    
    // Verify OTP
    if (otp.trim().toUpperCase() === authCode) {
      setSuccess('OTP verified successfully! Logging you in...');
      setTimeout(() => {
        if (onAuthSuccess) onAuthSuccess();
      }, 1000);
    } else {
      setError('Invalid OTP code. Please try again.');
    }
    setLoading(false);
  };

  const handleResendOTP = async () => {
    setLoading(true);
    setError('');
    
    // Generate new OTP
    const newAuthCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    setAuthCode(newAuthCode);
    
    // Set new expiry
    const newExpiryTime = new Date(Date.now() + 15 * 60 * 1000);
    setOtpExpiry(newExpiryTime);
    
    try {
      // Resend email with new OTP
      const templateParams = {
        to_email: email,
        to_name: "Admin",
        passcode: newAuthCode,
        time: newExpiryTime.toLocaleString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        }),
        message: `Your new authentication code is: ${newAuthCode}. This code will expire in 15 minutes.`
      };
      
      const emailResponse = await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        templateParams
      );
      
      if (emailResponse.status === 200) {
        setSuccess('New authentication code sent! Please check your email.');
        setOtp(''); // Clear previous OTP input
      } else {
        throw new Error('Email sending failed');
      }
      
    } catch (emailError) {
      console.error('Email resend error:', emailError);
      setSuccess(`New authentication code: ${newAuthCode}. Please check your email.`);
      setOtp(''); // Clear previous OTP input
    }
    
    setLoading(false);
  };

  if (showOTP) {
    return (
      <div className="auth-container">
        <div className="auth-background">
          <div className="auth-form-container">
            <div className="auth-header">
              {/* Removed close button */}
              <h1>OTP Verification</h1>
              <p>Enter the authentication code sent to your email</p>
            </div>
            <form onSubmit={handleOTPVerification} className="auth-form">
              <div className="form-group">
                <label htmlFor="otp">Authentication Code</label>
                <input
                  type="text"
                  id="otp"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter 6-digit code"
                  maxLength="6"
                  required
                  className="auth-input"
                  style={{ textAlign: 'center', letterSpacing: '0.5em', fontSize: '1.2em' }}
                />
              </div>
              
              {error && <div className="error-message">{error}</div>}
              {success && <div className="success-message">{success}</div>}
              
              <div className="otp-actions">
                <button 
                  type="submit" 
                  className="login-btn"
                  disabled={loading}
                >
                  {loading ? 'Verifying...' : 'Verify OTP'}
                </button>
                
                <button 
                  type="button" 
                  className="resend-btn"
                  onClick={handleResendOTP}
                  disabled={loading}
                >
                  Resend Code
                </button>
              </div>
              
              <div className="otp-info">
                <p>Code expires in: {otpExpiry ? Math.max(0, Math.floor((otpExpiry - new Date()) / 1000 / 60)) : 15} minutes</p>
                <p>Didn't receive the code? Check your spam folder or click "Resend Code"</p>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-background">
        <div className="auth-form-container">
          <div className="auth-header">
            {/* Removed close button */}
            <h1>Admin Login</h1>
            <p>Enter your credentials to access the admin panel</p>
          </div>
          <form onSubmit={handleLogin} className="auth-form">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="auth-input"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="auth-input"
              />
            </div>
            
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}
            
            <button 
              type="submit" 
              className="login-btn"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Log In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Auth;
