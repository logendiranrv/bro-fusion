import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser, clearError } from '../store/slices/authSlice';
import toast from 'react-hot-toast';

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, loading, error } = useSelector((state) => state.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      toast.success('Successfully logged in!');
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
    dispatch(loginUser({ email, password }));
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-[#10121A] border border-[#202434] rounded-2xl p-8 shadow-2xl flex flex-col gap-6">
        <div className="text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-400">Account Access</span>
          <h2 className="text-3xl font-extrabold text-white mt-1 font-['Syne']">Welcome Back</h2>
          <p className="text-xs text-zinc-400 mt-2">Log in to view your orders and saved wishlist</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 block mb-1.5">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. logan@gmail.com"
              className="w-full bg-[#08090D] border border-[#202434] rounded-xl px-4 py-3 text-sm text-zinc-200 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 block mb-1.5">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-[#08090D] border border-[#202434] rounded-xl px-4 py-3 text-sm text-zinc-200 focus:outline-none focus:border-amber-400"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="gold-gradient-btn w-full mt-2 py-3.5 rounded-xl uppercase tracking-wider text-xs cursor-pointer"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <p className="text-xs text-zinc-400 text-center">
          Don't have an account?{' '}
          <Link to="/register" className="text-amber-400 font-bold hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}
