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
      <div className="max-w-md w-full bg-white border border-[#D8C7B5] rounded-3xl p-8 shadow-sm flex flex-col gap-6">
        <div className="text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-[#8A6237]">Join Bro Fusion</span>
          <h2 className="text-3xl font-extrabold text-[#1E1712] mt-1 font-['Syne']">Create Account</h2>
          <p className="text-xs text-[#77624F] mt-2">Sign up for luxury streetwear drops and instant tracking</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-[#77624F] block mb-1.5">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Logendiran"
              className="w-full bg-[#F5EDE3]/40 border border-[#D8C7B5] rounded-xl px-4 py-3 text-sm text-[#1E1712] focus:outline-none focus:border-[#C69D71] focus:bg-white"
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-[#77624F] block mb-1.5">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. logan@gmail.com"
              className="w-full bg-[#F5EDE3]/40 border border-[#D8C7B5] rounded-xl px-4 py-3 text-sm text-[#1E1712] focus:outline-none focus:border-[#C69D71] focus:bg-white"
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-[#77624F] block mb-1.5">WhatsApp Phone Number</label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. 9876543210"
              className="w-full bg-[#F5EDE3]/40 border border-[#D8C7B5] rounded-xl px-4 py-3 text-sm text-[#1E1712] focus:outline-none focus:border-[#C69D71] focus:bg-white"
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-[#77624F] block mb-1.5">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-[#F5EDE3]/40 border border-[#D8C7B5] rounded-xl px-4 py-3 text-sm text-[#1E1712] focus:outline-none focus:border-[#C69D71] focus:bg-white"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="gold-gradient-btn w-full mt-2 py-3.5 rounded-xl uppercase tracking-wider text-xs cursor-pointer shadow-md"
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <p className="text-xs text-[#77624F] text-center">
          Already have an account?{' '}
          <Link to="/login" className="text-[#8A6237] font-bold hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
