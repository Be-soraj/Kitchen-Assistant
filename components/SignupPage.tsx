import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface SignupPageProps {
  onSwitchToLogin: () => void;
}

export const SignupPage: React.FC<SignupPageProps> = ({ onSwitchToLogin }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (password.length < 6) {
        return setError("Password must be at least 6 characters long.");
    }
    setError('');
    setLoading(true);

    try {
      await signup(name, email, password);
    } catch (err: any) {
      setError(err.message || 'Failed to create an account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 font-sans">
      <div className="w-full max-w-md p-8 space-y-8 bg-white shadow-xl rounded-2xl border border-gray-100">
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19.5 13.63V8.81a7.5 7.5 0 0 0-5.4-7.23 7.5 7.5 0 0 0-9.6 7.23v4.82" />
              <path d="M19.5 13.63A4.5 4.5 0 0 1 15 18.13h-6a4.5 4.5 0 0 1-4.5-4.5v0" />
              <path d="M4.5 13.63V8.81" /><path d="M4.5 8.81A7.5 7.5 0 0 1 9.6 1.58" />
              <path d="M14.1 1.58A7.5 7.5 0 0 1 19.5 8.81" /><path d="M9 18.13h6" /><path d="M9 14h6" />
            </svg>
            <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Create an Account</h1>
          </div>
          <p className="mt-2 text-gray-600">Join the AI Kitchen community.</p>
        </div>
        
        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-sm" role="alert">{error}</div>}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
             <div>
              <label htmlFor="name">Full Name</label>
              <input id="name" name="name" type="text" required className="mt-1 appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm bg-white" placeholder="Your Name" value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div>
              <label htmlFor="email-address">Email address</label>
              <input id="email-address" name="email" type="email" required className="mt-1 appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm bg-white" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div>
              <label htmlFor="password">Password</label>
              <input id="password" name="password" type="password" required className="mt-1 appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm bg-white" placeholder="Password (min. 6 characters)" value={password} onChange={e => setPassword(e.target.value)} />
            </div>
          </div>

          <div>
            <button type="submit" disabled={loading} className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-transform transform hover:scale-105 disabled:bg-gray-400">
              {loading ? 'Creating account...' : 'Sign up'}
            </button>
          </div>
        </form>
         <p className="mt-4 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <button onClick={onSwitchToLogin} className="font-medium text-green-600 hover:text-green-500">
                Sign in
            </button>
        </p>
      </div>
    </div>
  );
};
