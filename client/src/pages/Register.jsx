import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser, clearError } from '../store/slices/authSlice';
import toast from 'react-hot-toast';

export default function Register() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, loading, error } = useSelector((state) => state.auth);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      toast.success('Successfully registered!');
      navigate('/');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(registerUser({ name, email, phone, password }));
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-2xl flex flex-col gap-6">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-white">Create Account</h2>
          <p className="text-sm text-zinc-400 mt-2">Sign up for Bro Fusion streetwear drops</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-xs text-zinc-400 block mb-1">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Name"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-200 focus:outline-none focus:border-zinc-700"
            />
          </div>

          <div>
            <label className="text-xs text-zinc-400 block mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-200 focus:outline-none focus:border-zinc-700"
            />
          </div>

          <div>
            <label className="text-xs text-zinc-400 block mb-1">Phone Number</label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Phone"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-200 focus:outline-none focus:border-zinc-700"
            />
          </div>

          <div>
            <label className="text-xs text-zinc-400 block mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-200 focus:outline-none focus:border-zinc-700"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-gradient-to-r from-amber-500 to-purple-600 hover:from-amber-600 hover:to-purple-700 disabled:opacity-50 text-white font-bold py-3 rounded-lg shadow-lg cursor-pointer transition-all"
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <p className="text-sm text-zinc-500 text-center">
          Already have an account?{' '}
          <Link to="/login" className="text-amber-400 hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
