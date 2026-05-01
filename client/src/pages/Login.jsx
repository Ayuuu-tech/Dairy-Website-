import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Store, Mail, Lock, Phone, User as UserIcon, Loader2, CheckCircle2, ArrowRight, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { GoogleLogin } from '@react-oauth/google';

export default function Login() {
  const location = useLocation();
  const [step, setStep] = useState('form'); // 'form' | 'otp'
  const [isLogin, setIsLogin] = useState(location.pathname !== '/signup');
  const [role, setRole] = useState('customer'); // 'customer' | 'admin'
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timer, setTimer] = useState(0);
  const [otp, setOtp] = useState(['', '', '', '']);
  
  const { login, register, sendOtp, googleLogin } = useAuth();
  const navigate = useNavigate();
  const inputRefs = [useRef(), useRef(), useRef(), useRef()];

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  // Countdown timer effect for OTP
  useEffect(() => {
    let interval;
    if (timer > 0 && step === 'otp') {
      interval = setInterval(() => setTimer(t => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer, step]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Step 1: Handle initial form submit to send OTP
  const handleFormSubmit = async (e) => {
    e?.preventDefault();
    
    if (!isLogin && formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    
    setIsSubmitting(true);
    try {
      await sendOtp(formData.email);
      setStep('otp');
      setTimer(60);
      toast.success('Verification code sent to your email');
      setTimeout(() => inputRefs[0].current?.focus(), 100);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send verification code');
    } finally {
      setIsSubmitting(false);
    }
  };

  // OTP Handlers
  const handleOtpChange = (index, value) => {
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value !== '' && index < 3) {
      inputRefs[index + 1].current.focus();
    }
    
    if (newOtp.every(v => v !== '') && index === 3) {
      verifyAndProceed(newOtp.join(''));
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs[index - 1].current.focus();
    }
  };

  // Step 2: Verify OTP and actual Login/Register
  const verifyAndProceed = async (code) => {
    setIsSubmitting(true);
    try {
      let data;
      if (isLogin) {
        data = await login({ 
          email: formData.email, 
          password: formData.password,
          otp: code
        });
        toast.success("Welcome back!");
      } else {
        data = await register({
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          password: formData.password,
          role,
          otp: code
        });
        toast.success("Account created successfully!");
      }
      
      if (data.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid verification code");
      setOtp(['', '', '', '']);
      inputRefs[0].current?.focus();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setIsSubmitting(true);
    try {
      const data = await googleLogin(credentialResponse.credential);
      toast.success(isLogin ? "Welcome back!" : "Account created successfully!");
      if (data.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Google authentication failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col pt-12 px-4 items-center bg-gray-50/50 relative overflow-hidden" style={{ backgroundImage: 'radial-gradient(#e5e7eb 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
      
      {/* Brand Logo */}
      <div className="mb-8 flex flex-col items-center">
        <div className="bg-primary p-2 rounded-lg mb-2">
          <Store className="text-white w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold text-primary">DairyFresh</h1>
      </div>

      {/* Main Card */}
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 w-full max-w-md relative overflow-hidden">
        
        {step === 'form' ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {isLogin ? 'Welcome Back' : 'Join DairyFresh'}
              </h2>
              <p className="text-gray-500 text-sm mt-1">
                {isLogin ? 'Enter your details to access your account' : 'Start your journey to fresh, local dairy today'}
              </p>
            </div>

            {/* Role Toggle */}
            <div className="flex gap-4 mb-6">
              <button
                type="button"
                onClick={() => setRole('customer')}
                className={`flex-1 flex flex-col items-center justify-center p-3 rounded-xl border ${
                  role === 'customer' 
                    ? 'border-primary bg-primary-light text-primary' 
                    : 'border-gray-200 text-gray-500 hover:border-gray-300'
                }`}
              >
                <UserIcon size={20} className="mb-1" />
                <span className="text-sm font-semibold">Customer</span>
              </button>
              <button
                type="button"
                onClick={() => setRole('admin')}
                className={`flex-1 flex flex-col items-center justify-center p-3 rounded-xl border ${
                  role === 'admin' 
                    ? 'border-primary bg-primary-light text-primary' 
                    : 'border-gray-200 text-gray-500 hover:border-gray-300'
                }`}
              >
                <ShieldCheck size={20} className="mb-1" />
                <span className="text-sm font-semibold">Admin</span>
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              {!isLogin && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        <User size={18} />
                      </div>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required={!isLogin}
                        className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-sm"
                        placeholder="John Doe"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        <Phone size={18} />
                      </div>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required={!isLogin}
                        className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-sm"
                        placeholder="+91 9876543210"
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Mail size={18} />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-sm"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Lock size={18} />
                  </div>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-sm"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <Lock size={18} />
                    </div>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required={!isLogin}
                      className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-sm"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              )}

              {isLogin && (
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center">
                    <input id="remember-me" type="checkbox" className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded" />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">Remember me</label>
                  </div>
                  <div className="text-sm">
                    <a href="#" className="font-medium text-primary hover:text-primary-dark">Forgot password?</a>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-70 disabled:cursor-not-allowed mt-6"
              >
                {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : (isLogin ? 'Sign In & Send OTP' : 'Create Account & Send OTP')}
              </button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or continue with</span>
                </div>
              </div>

              <div className="mt-6 flex justify-center">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => {
                    toast.error('Google Login Failed');
                  }}
                  useOneTap
                  theme="outline"
                  size="large"
                  text={isLogin ? "signin_with" : "signup_with"}
                  width="100%"
                />
              </div>
            </div>

            <div className="mt-6 text-center">
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setFormData({ name: '', phone: '', email: '', password: '', confirmPassword: '' });
                }}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <span className="font-bold text-primary hover:underline">
                  {isLogin ? 'Sign up' : 'Log in'}
                </span>
              </button>
            </div>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            
            <button 
              onClick={() => setStep('form')}
              className="text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors flex items-center gap-1"
            >
              &larr; Back
            </button>

            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-green-50 text-green-600 rounded-full mb-4">
                <CheckCircle2 size={24} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Verify your Email</h2>
              <p className="text-gray-500 text-sm mt-2">
                We've sent a 4-digit verification code to <br/>
                <span className="font-medium text-gray-900">{formData.email}</span>
              </p>
            </div>

            <div className="flex justify-between gap-3 sm:gap-4 mb-8 px-2">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={inputRefs[index]}
                  type="text"
                  maxLength="1"
                  inputMode="numeric"
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  className="w-14 h-16 sm:w-16 sm:h-20 text-center text-3xl font-bold bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                />
              ))}
            </div>

            <button
              onClick={() => verifyAndProceed(otp.join(''))}
              disabled={isSubmitting || otp.some(v => v === '')}
              className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl text-white bg-gray-900 hover:bg-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-all disabled:opacity-70 disabled:cursor-not-allowed font-semibold text-sm shadow-sm"
            >
              {isSubmitting ? (
                <Loader2 className="animate-spin w-5 h-5" />
              ) : (
                'Verify & Proceed'
              )}
            </button>

            <div className="mt-8 text-center">
              <p className="text-sm text-gray-500">
                Didn't receive the code?{' '}
                {timer > 0 ? (
                  <span className="font-medium text-gray-400">Resend in {timer}s</span>
                ) : (
                  <button 
                    onClick={handleFormSubmit}
                    disabled={isSubmitting}
                    className="font-medium text-primary hover:text-primary/80 transition-colors"
                  >
                    Resend now
                  </button>
                )}
              </p>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
