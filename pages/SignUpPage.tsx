import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../App';

const SignUpPage: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const { signup, signInWithGoogle } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (fullName && email && phone && password) { // Simple validation
      signup(fullName, email, phone, password);
    } else {
      alert("Please fill in all fields.");
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
      <div className="bg-gray-800 p-8 rounded-lg shadow-2xl w-full max-w-md">
        <h1 className="text-2xl font-bold text-cyan-400 mb-2 text-center">Tuma-Africa Link Cargo</h1>
        <h3 className="text-2xl font-bold mb-6 text-center text-white">Create an Account</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="fullName-signup" className="sr-only">Full Name</label>
            <input
              id="fullName-signup"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Full Name"
              required
              className="w-full p-3 bg-gray-700 rounded border border-gray-600 focus:ring-cyan-500 focus:border-cyan-500 text-white"
            />
          </div>
          <div>
            <label htmlFor="email-signup" className="sr-only">Email</label>
            <input
              id="email-signup"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email Address"
              required
              className="w-full p-3 bg-gray-700 rounded border border-gray-600 focus:ring-cyan-500 focus:border-cyan-500 text-white"
            />
          </div>
           <div>
            <label htmlFor="phone-signup" className="sr-only">Phone Number</label>
            <input
              id="phone-signup"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Phone Number"
              required
              className="w-full p-3 bg-gray-700 rounded border border-gray-600 focus:ring-cyan-500 focus:border-cyan-500 text-white"
            />
          </div>
          <div>
            <label htmlFor="password-signup" className="sr-only">Password</label>
            <input
              id="password-signup"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              className="w-full p-3 bg-gray-700 rounded border border-gray-600 focus:ring-cyan-500 focus:border-cyan-500 text-white"
            />
          </div>
          <button type="submit" className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-4 rounded-lg transition-colors">Sign Up</button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-600"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-gray-800 px-2 text-gray-400">Or sign up with</span>
          </div>
        </div>

        <div>
          <button onClick={signInWithGoogle} type="button" className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-gray-600 rounded-lg hover:bg-gray-700/50 transition-colors">
            {/* Google Icon SVG */}
            <svg className="w-5 h-5" viewBox="0 0 48 48">
              <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.618-3.229-11.303-7.572l-6.571,4.819C9.656,39.663,16.318,44,24,44z"></path><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C42.022,35.319,44,30.026,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
            </svg>
            <span className="text-sm font-semibold text-white">Google</span>
          </button>
        </div>

        <p className="text-sm text-gray-400 mt-6 text-center">
          Already have an account? <Link to="/login" className="font-medium text-cyan-400 hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  );
};

export default SignUpPage;