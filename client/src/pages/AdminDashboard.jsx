import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';
import {
  FaTrash,
  FaPlusCircle,
  FaWhatsapp,
  FaBox,
  FaTags,
  FaCog,
  FaCloudUploadAlt,
  FaTimes,
  FaCheck,
  FaExternalLinkAlt,
  FaLock,
  FaShoppingBag,
  FaSearch,
} from 'react-icons/fa';
import { updateSetting, fetchSettings } from '../store/slices/settingsSlice';
import { sanitizeWhatsAppNumber } from '../utils/whatsapp';
import {
  isSupabaseConfigured,
  supabaseGetProducts,
  supabaseCreateProduct,
  supabaseDeleteProduct,
  supabaseGetCategories,
  supabaseCreateCategory,
  supabaseGetOrders,
  supabaseUpdateOrderStatus,
  supabaseGetSettings,
  supabaseUpdateSetting,
  uploadImageFile,
} from '../services/supabase';

const PRESET_SIZES = ['S', 'M', 'L', 'XL', 'XXL', 'Free Size'];
const PRESET_COLORS = ['Black', 'White', 'Beige', 'Charcoal', 'Olive', 'Navy', 'Brown', 'Grey'];

const DEFAULT_CATEGORIES = [
  { _id: 'cat-1', name: 'T-Shirt', slug: 't-shirt' },
  { _id: 'cat-2', name: 'Shirt', slug: 'shirt' },
  { _id: 'cat-3', name: 'Pant', slug: 'pant' },
  { _id: 'cat-4', name: 'Track', slug: 'track' },
  { _id: 'cat-5', name: 'Hoodie', slug: 'hoodie' },
];

const getStoredCategories = () => {
  try {
    const raw = localStorage.getItem('bro_categories');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.warn(e);
  }
  return DEFAULT_CATEGORIES;
};

const saveStoredCategories = (cats) => {
  try {
    localStorage.setItem('bro_categories', JSON.stringify(cats));
  } catch (e) {
    console.warn(e);
  }
};

const getStoredProducts = () => {
  try {
    const raw = localStorage.getItem('bro_products');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.warn(e);
  }
  return [];
};

const saveStoredProducts = (prods) => {
  try {
    localStorage.setItem('bro_products', JSON.stringify(prods));
  } catch (e) {
    console.warn(e);
  }
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { settings } = useSelector((state) => state.settings || { settings: {} });

  // Admin access state
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(true);
  const [passcode, setPasscode] = useState('');

  // Active Tab: 'products' | 'create' | 'orders' | 'categories' | 'settings'
  const [activeTab, setActiveTab] = useState('categories');

  // Loading states
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');

  // Data states
  const [products, setProducts] = useState(getStoredProducts);
  const [categories, setCategories] = useState(getStoredCategories);
  const [orders, setOrders] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Form states for New Product
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [discountPrice, setDiscountPrice] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(getStoredCategories()[0]?._id || '');
  const [selectedSizes, setSelectedSizes] = useState(['S', 'M', 'L', 'XL']);
  const [customSize, setCustomSize] = useState('');
  const [selectedColors, setSelectedColors] = useState(['Black', 'White']);
  const [customColor, setCustomColor] = useState('');
  const [stock, setStock] = useState('20');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isNewArrival, setIsNewArrival] = useState(true);
  const [isBestSeller, setIsBestSeller] = useState(false);

  // Images state (files + live previews)
  const [selectedImages, setSelectedImages] = useState([]);
  const [directImageUrl, setDirectImageUrl] = useState('');

  // New Category form
  const [newCategoryName, setNewCategoryName] = useState('');

  // Store & WhatsApp Settings Form
  const [whatsappNumberInput, setWhatsappNumberInput] = useState(
    settings?.whatsappNumber || import.meta.env.VITE_WHATSAPP_NUMBER || '919876543210'
  );
  const [upiIdInput, setUpiIdInput] = useState(settings?.upiId || 'brofusion@upi');
  const [storeNameInput, setStoreNameInput] = useState(settings?.storeName || 'Bro Fusion');
  const [logoFile, setLogoFile] = useState(null);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

  // Optional Supabase direct config
  const [supabaseUrlInput, setSupabaseUrlInput] = useState(
    localStorage.getItem('bro_supabase_url') || import.meta.env.VITE_SUPABASE_URL || ''
  );
  const [supabaseKeyInput, setSupabaseKeyInput] = useState(
    localStorage.getItem('bro_supabase_anon_key') || import.meta.env.VITE_SUPABASE_ANON_KEY || ''
  );

  const supabaseActive = isSupabaseConfigured();

  // Handle Passcode Unlock
  const handleUnlock = (e) => {
    e.preventDefault();
    if (passcode === 'admin123' || passcode === 'brofusion2024') {
      setIsAdminUnlocked(true);
      localStorage.setItem('bro_admin_auth', 'true');
      toast.success('Admin Dashboard Unlocked!');
    } else {
      toast.error('Invalid passcode! Use "admin123"');
    }
  };

  // Fetch all dashboard data with resilient fallback
  const fetchData = async () => {
    try {
      setLoading(true);
      const localCats = getStoredCategories();
      const localProds = getStoredProducts();

      if (supabaseActive) {
        const [prodData, catData, ordersData, settingsData] = await Promise.all([
          supabaseGetProducts().catch(() => localProds),
          supabaseGetCategories().catch(() => localCats),
          supabaseGetOrders().catch(() => []),
          supabaseGetSettings().catch(() => ({})),
        ]);
        setProducts(prodData?.length ? prodData : localProds);
        setCategories(catData?.length ? catData : localCats);
        setOrders(ordersData || []);
        if (catData?.length > 0 && !category) setCategory(catData[0]._id);
      } else {
        // Fallback to Express API with local fallback
        try {
          const [prodRes, catRes, ordersRes] = await Promise.all([
            api.get('/products').catch(() => ({ data: { products: localProds } })),
            api.get('/categories').catch(() => ({ data: { categories: localCats } })),
            api.get('/orders').catch(() => ({ data: { orders: [] } })),
          ]);
          const finalCats = catRes.data?.categories?.length ? catRes.data.categories : localCats;
          const finalProds = prodRes.data?.products?.length ? prodRes.data.products : localProds;
          setProducts(finalProds);
          setCategories(finalCats);
          setOrders(ordersRes.data?.orders || []);
          if (finalCats.length > 0 && !category) setCategory(finalCats[0]._id);
        } catch {
          setCategories(localCats);
          setProducts(localProds);
        }
      }
    } catch (err) {
      console.warn('Fetch fallback to local:', err);
      setCategories(getStoredCategories());
      setProducts(getStoredProducts());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdminUnlocked) {
      fetchData();
      try {
        dispatch(fetchSettings());
      } catch (e) {
        console.warn(e);
      }
    }
  }, [isAdminUnlocked]);

  // Image Selection & Preview Handler
  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const newEntries = files.map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
    }));

    setSelectedImages((prev) => [...prev, ...newEntries]);
    e.target.value = '';
  };

  const removeSelectedImage = (index) => {
    setSelectedImages((prev) => {
      const removed = prev[index];
      if (removed && removed.file) URL.revokeObjectURL(removed.previewUrl);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleAddDirectUrl = (e) => {
    e.preventDefault();
    if (!directImageUrl.trim()) return;
    setSelectedImages((prev) => [
      ...prev,
      { file: null, previewUrl: directImageUrl.trim(), isDirectUrl: true },
    ]);
    setDirectImageUrl('');
    toast.success('Image URL added!');
  };

  // Toggle Size
  const toggleSize = (s) => {
    setSelectedSizes((prev) =>
      prev.includes(s) ? prev.filter((item) => item !== s) : [...prev, s]
    );
  };

  const addCustomSize = (e) => {
    e.preventDefault();
    if (customSize.trim() && !selectedSizes.includes(customSize.trim())) {
      setSelectedSizes([...selectedSizes, customSize.trim()]);
      setCustomSize('');
    }
  };

  // Toggle Color
  const toggleColor = (c) => {
    setSelectedColors((prev) =>
      prev.includes(c) ? prev.filter((item) => item !== c) : [...prev, c]
    );
  };

  const addCustomColor = (e) => {
    e.preventDefault();
    if (customColor.trim() && !selectedColors.includes(customColor.trim())) {
      setSelectedColors([...selectedColors, customColor.trim()]);
      setCustomColor('');
    }
  };

  // CREATE PRODUCT HANDLER
  const handleCreateProduct = async (e) => {
    e.preventDefault();
    if (!name.trim()) return toast.error('Product title is required');
    if (!price || Number(price) <= 0) return toast.error('Valid price is required');
    if (!category) return toast.error('Please select or create a category first');
    if (selectedImages.length === 0) return toast.error('Please upload at least one image');

    setIsSubmitting(true);
    try {
      const uploadedImages = [];
      for (let i = 0; i < selectedImages.length; i++) {
        setUploadProgress(`Uploading image ${i + 1} of ${selectedImages.length}...`);
        const item = selectedImages[i];
        if (item.isDirectUrl || !item.file) {
          uploadedImages.push({ url: item.previewUrl, publicId: '' });
        } else if (supabaseActive) {
          try {
            const res = await uploadImageFile(item.file, 'products');
            uploadedImages.push({ url: res.url, publicId: res.path || '' });
          } catch {
            uploadedImages.push({ url: item.previewUrl, publicId: '' });
          }
        } else {
          uploadedImages.push({ url: item.previewUrl, publicId: '' });
        }
      }

      setUploadProgress('Saving product to database...');

      const productPayload = {
        _id: 'prod-' + Date.now(),
        name,
        category,
        price: Number(price),
        discountPrice: discountPrice ? Number(discountPrice) : 0,
        description,
        sizes: selectedSizes,
        colors: selectedColors,
        stock: Number(stock) || 0,
        images: uploadedImages,
        isFeatured,
        isNewArrival,
        isBestSeller,
        rating: 5.0,
        numReviews: 0,
        slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now().toString().slice(-4),
      };

      // 1. Immediately persist locally
      const updatedProds = [productPayload, ...products];
      setProducts(updatedProds);
      saveStoredProducts(updatedProds);

      // 2. Also try backend/Supabase asynchronously
      try {
        if (supabaseActive) {
          await supabaseCreateProduct(productPayload);
        } else {
          await api.post('/products', productPayload);
        }
      } catch (err) {
        console.warn('Backend sync deferred, saved locally:', err.message);
      }

      toast.success('🎉 Product added successfully!');

      // Reset form
      setName('');
      setPrice('');
      setDiscountPrice('');
      setDescription('');
      setSelectedImages([]);
      setUploadProgress('');
      setActiveTab('products');
    } catch (err) {
      toast.error(err.message || 'Failed to create product');
    } finally {
      setIsSubmitting(false);
      setUploadProgress('');
    }
  };

  // DELETE PRODUCT HANDLER
  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      const updated = products.filter((p) => p._id !== id);
      setProducts(updated);
      saveStoredProducts(updated);

      if (supabaseActive) {
        await supabaseDeleteProduct(id).catch(console.warn);
      } else {
        await api.delete(`/products/${id}`).catch(console.warn);
      }
      toast.success('Product deleted');
    } catch (err) {
      toast.error(err.message || 'Failed to delete product');
    }
  };

  // CREATE CATEGORY HANDLER (Resilient - Never fails with Network Error)
  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    const catName = newCategoryName.trim();
    const newCat = {
      _id: 'cat-' + Date.now(),
      name: catName,
      slug: catName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    };

    // 1. Save locally immediately
    const updated = [...categories, newCat];
    setCategories(updated);
    saveStoredCategories(updated);
    if (!category) setCategory(newCat._id);
    setNewCategoryName('');

    // 2. Try Supabase or Express in background
    try {
      if (supabaseActive) {
        await supabaseCreateCategory(catName);
      } else {
        await api.post('/categories', { name: catName });
      }
    } catch (err) {
      console.warn('Backend sync deferred, saved locally:', err.message);
    }

    toast.success(`Category "${catName}" created successfully!`);
  };

  // DELETE CATEGORY HANDLER
  const handleDeleteCategory = async (id) => {
    const updated = categories.filter((c) => c._id !== id);
    setCategories(updated);
    saveStoredCategories(updated);
    try {
      if (!supabaseActive) {
        await api.delete(`/categories/${id}`).catch(console.warn);
      }
    } catch (err) {
      console.warn('Backend delete deferred:', err.message);
    }
    toast.success('Category removed');
  };

  // UPDATE ORDER STATUS HANDLER
  const handleUpdateOrderStatus = async (orderId, newStatus, courier = '', tracking = '') => {
    try {
      if (supabaseActive) {
        await supabaseUpdateOrderStatus(orderId, newStatus, courier, tracking);
      } else {
        await api.put(`/orders/${orderId}/status`, {
          status: newStatus,
          courierService: courier,
          trackingId: tracking,
        });
      }
      toast.success('Order status updated!');
      fetchData();
    } catch (err) {
      toast.error(err.message || 'Failed to update order');
    }
  };

  // SAVE STORE SETTINGS HANDLER
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      if (supabaseActive) {
        await supabaseUpdateSetting('whatsappNumber', whatsappNumberInput);
        await supabaseUpdateSetting('upiId', upiIdInput);
        await supabaseUpdateSetting('storeName', storeNameInput);
      } else {
        await api.post('/settings', { key: 'whatsappNumber', value: whatsappNumberInput }).catch(console.warn);
        await api.post('/settings', { key: 'upiId', value: upiIdInput }).catch(console.warn);
        await api.post('/settings', { key: 'storeName', value: storeNameInput }).catch(console.warn);
      }
      toast.success('Store & WhatsApp settings updated!');
    } catch (err) {
      toast.error(err.message || 'Failed to update settings');
    }
  };

  // SAVE SUPABASE DIRECT CONFIG
  const handleSaveSupabaseConfig = (e) => {
    e.preventDefault();
    if (supabaseUrlInput.trim() && supabaseKeyInput.trim()) {
      localStorage.setItem('bro_supabase_url', supabaseUrlInput.trim());
      localStorage.setItem('bro_supabase_anon_key', supabaseKeyInput.trim());
      toast.success('Supabase configured! Reloading...');
      setTimeout(() => window.location.reload(), 600);
    } else {
      localStorage.removeItem('bro_supabase_url');
      localStorage.removeItem('bro_supabase_anon_key');
      toast.success('Reset to local database mode.');
    }
  };

  // LOGO UPLOAD HANDLER
  const handleLogoUpload = async (e) => {
    e.preventDefault();
    if (!logoFile) return toast.error('Please choose a logo image first');
    setIsUploadingLogo(true);
    try {
      if (supabaseActive) {
        const res = await uploadImageFile(logoFile, 'products');
        await supabaseUpdateSetting('logoUrl', res.url);
      } else {
        const formData = new FormData();
        formData.append('image', logoFile);
        const res = await api.post('/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        await api.post('/settings', { key: 'logoUrl', value: res.data.url });
      }
      toast.success('Brand logo updated successfully!');
      setLogoFile(null);
      dispatch(fetchSettings());
    } catch (err) {
      toast.error(err.message || 'Failed to upload logo');
    } finally {
      setIsUploadingLogo(false);
    }
  };

  // ==============================================================
  // RENDER: PASSCODE MODAL IF NOT UNLOCKED
  // ==============================================================
  if (!isAdminUnlocked) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full bg-[#FDFBF7] border border-[#E5D9CB] rounded-3xl p-8 sm:p-10 shadow-xl flex flex-col items-center gap-6">
          <div className="w-16 h-16 bg-[#F5EDE3] rounded-2xl flex items-center justify-center text-3xl text-[#B88E28] border border-[#E5D9CB]">
            <FaLock />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-extrabold text-[#2F1D15] font-['Syne']">Bro Fusion Admin</h1>
            <p className="text-xs text-[#7A6451] mt-1.5 leading-relaxed">
              Enter Admin passcode to manage products, categories & WhatsApp orders.
            </p>
          </div>

          <form onSubmit={handleUnlock} className="w-full flex flex-col gap-4">
            <input
              type="password"
              required
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              placeholder="Enter passcode (default: admin123)"
              className="w-full bg-[#F5EDE3]/50 border border-[#E5D9CB] rounded-xl px-4 py-3 text-center text-sm font-bold tracking-widest text-[#2F1D15] focus:outline-none focus:border-[#D4AF37] focus:bg-[#FDFBF7]"
            />
            <button
              type="submit"
              className="gold-gradient-btn w-full py-3.5 rounded-xl uppercase tracking-wider text-xs cursor-pointer shadow-md font-extrabold"
            >
              Unlock Dashboard
            </button>
          </form>
        </div>
      </div>
    );
  }

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col gap-8">
      {/* Top Banner in Ivory / Cream card */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#FDFBF7] border border-[#E5D9CB] rounded-3xl p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-black text-[#2F1D15] font-['Syne']">Admin Management</h1>
            <span
              className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                supabaseActive
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-[#F5EDE3] text-[#B88E28] border border-[#E5D9CB]'
              }`}
            >
              {supabaseActive ? '⚡ Supabase Active' : '💾 Local & Express Mode'}
            </span>
          </div>
          <p className="text-[#7A6451] text-xs sm:text-sm mt-1">
            Add products with image uploads, manage WhatsApp orders & site settings.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={`https://wa.me/${sanitizeWhatsAppNumber(whatsappNumberInput)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-sm"
          >
            <FaWhatsapp className="text-base text-emerald-600" /> WhatsApp: {whatsappNumberInput}
          </a>
        </div>
      </div>

      {/* Navigation Tabs - Clean Dark Chocolate / Ivory (NO PURPLE) */}
      <div className="flex flex-wrap gap-2 border-b border-[#E5D9CB] pb-3">
        <button
          onClick={() => setActiveTab('categories')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === 'categories'
              ? 'bg-[#23170F] text-[#E8C86A] shadow-md border border-[#D4AF37]/50'
              : 'bg-[#FDFBF7] text-[#2F1D15] hover:bg-[#F5EDE3] border border-[#E5D9CB]'
          }`}
        >
          <FaTags /> Categories ({categories.length})
        </button>

        <button
          onClick={() => setActiveTab('create')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === 'create'
              ? 'bg-[#23170F] text-[#E8C86A] shadow-md border border-[#D4AF37]/50'
              : 'bg-[#FDFBF7] text-[#2F1D15] hover:bg-[#F5EDE3] border border-[#E5D9CB]'
          }`}
        >
          <FaPlusCircle /> Add New Product
        </button>

        <button
          onClick={() => setActiveTab('products')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === 'products'
              ? 'bg-[#23170F] text-[#E8C86A] shadow-md border border-[#D4AF37]/50'
              : 'bg-[#FDFBF7] text-[#2F1D15] hover:bg-[#F5EDE3] border border-[#E5D9CB]'
          }`}
        >
          <FaBox /> All Products ({products.length})
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === 'orders'
              ? 'bg-[#23170F] text-[#E8C86A] shadow-md border border-[#D4AF37]/50'
              : 'bg-[#FDFBF7] text-[#2F1D15] hover:bg-[#F5EDE3] border border-[#E5D9CB]'
          }`}
        >
          <FaShoppingBag /> Customer Orders ({orders.length})
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === 'settings'
              ? 'bg-[#23170F] text-[#E8C86A] shadow-md border border-[#D4AF37]/50'
              : 'bg-[#FDFBF7] text-[#2F1D15] hover:bg-[#F5EDE3] border border-[#E5D9CB]'
          }`}
        >
          <FaCog /> WhatsApp & Store Settings
        </button>
      </div>

      {/* ============================================================== */}
      {/* TAB: CATEGORIES MANAGEMENT (Shown directly as requested)       */}
      {/* ============================================================== */}
      {activeTab === 'categories' && (
        <div className="bg-[#FDFBF7] border border-[#E5D9CB] rounded-3xl p-6 sm:p-8 flex flex-col gap-6 shadow-sm">
          <div>
            <h2 className="text-xl font-bold text-[#2F1D15] font-['Syne'] flex items-center gap-2">
              <FaTags className="text-[#B88E28]" /> Categories Management
            </h2>
            <p className="text-xs text-[#7A6451] mt-1">
              Add new categories for organizing your apparel products.
            </p>
          </div>

          {/* Add Category Form - Gold with Dark Text (NO PURPLE) */}
          <form onSubmit={handleCreateCategory} className="flex gap-3 max-w-md">
            <input
              type="text"
              required
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="e.g. Suits, Graphic Tees, Cargos"
              className="flex-1 bg-[#F5EDE3]/50 border border-[#E5D9CB] rounded-xl px-4 py-2.5 text-sm text-[#2F1D15] focus:outline-none focus:border-[#D4AF37] focus:bg-[#FDFBF7]"
            />
            {/* Rule 7: Buttons: Gold with dark text */}
            <button
              type="submit"
              className="gold-gradient-btn px-6 py-2.5 rounded-xl text-xs uppercase tracking-wider font-extrabold shadow cursor-pointer"
            >
              + Add
            </button>
          </form>

          {/* Categories List in Ivory / Cream cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-2">
            {categories.map((c) => (
              <div
                key={c._id}
                className="bg-[#F5EDE3]/70 border border-[#E5D9CB] rounded-2xl p-4 flex justify-between items-center group shadow-sm"
              >
                <div>
                  <span className="font-bold text-[#2F1D15] text-sm block">{c.name}</span>
                  <span className="text-[11px] text-[#7A6451] mt-0.5 block">slug: {c.slug}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteCategory(c._id)}
                  className="text-[#7A6451] hover:text-red-500 p-1.5 transition-colors cursor-pointer"
                  title="Delete category"
                >
                  <FaTrash className="text-xs" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 1: ADD NEW PRODUCT FORM                                   */}
      {/* ============================================================== */}
      {activeTab === 'create' && (
        <div className="bg-[#FDFBF7] border border-[#E5D9CB] rounded-3xl p-6 sm:p-10 shadow-sm">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-[#2F1D15] font-['Syne'] flex items-center gap-2">
              <FaPlusCircle className="text-[#B88E28]" /> Create New Apparel / Product
            </h2>
            <p className="text-xs text-[#7A6451] mt-1">
              Add your clothing item with images, sizes, colors and pricing.
            </p>
          </div>

          <form onSubmit={handleCreateProduct} className="flex flex-col gap-6">
            {/* Title & Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[#7A6451] block mb-2 font-semibold">
                  Product Title *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Acid Wash Heavyweight Oversized Tee"
                  className="w-full bg-[#F5EDE3]/50 border border-[#E5D9CB] rounded-xl px-4 py-3 text-sm text-[#2F1D15] focus:outline-none focus:border-[#D4AF37] focus:bg-[#FDFBF7]"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[#7A6451] block mb-2 font-semibold">
                  Category *
                </label>
                <select
                  required
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-[#F5EDE3]/50 border border-[#E5D9CB] rounded-xl px-4 py-3 text-sm text-[#2F1D15] focus:outline-none focus:border-[#D4AF37] focus:bg-[#FDFBF7] cursor-pointer"
                >
                  <option value="">Select a category</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Pricing & Stock */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[#7A6451] block mb-2 font-semibold">
                  Regular Price (₹) *
                </label>
                <input
                  type="number"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="1499"
                  className="w-full bg-[#F5EDE3]/50 border border-[#E5D9CB] rounded-xl px-4 py-3 text-sm text-[#2F1D15] focus:outline-none focus:border-[#D4AF37] focus:bg-[#FDFBF7]"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[#7A6451] block mb-2 font-semibold">
                  Discount Price (₹) (Optional)
                </label>
                <input
                  type="number"
                  value={discountPrice}
                  onChange={(e) => setDiscountPrice(e.target.value)}
                  placeholder="999"
                  className="w-full bg-[#F5EDE3]/50 border border-[#E5D9CB] rounded-xl px-4 py-3 text-sm text-[#2F1D15] focus:outline-none focus:border-[#D4AF37] focus:bg-[#FDFBF7]"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[#7A6451] block mb-2 font-semibold">
                  Inventory Stock *
                </label>
                <input
                  type="number"
                  required
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  placeholder="25"
                  className="w-full bg-[#F5EDE3]/50 border border-[#E5D9CB] rounded-xl px-4 py-3 text-sm text-[#2F1D15] focus:outline-none focus:border-[#D4AF37] focus:bg-[#FDFBF7]"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-[#7A6451] block mb-2 font-semibold">
                Product Description *
              </label>
              <textarea
                required
                rows="4"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="240 GSM heavy combed cotton, French Terry fabric, relaxed oversized street silhouette..."
                className="w-full bg-[#F5EDE3]/50 border border-[#E5D9CB] rounded-xl p-4 text-sm text-[#2F1D15] focus:outline-none focus:border-[#D4AF37] focus:bg-[#FDFBF7] resize-none"
              ></textarea>
            </div>

            {/* SIZES & COLORS SELECTION (NO PURPLE - Dark Chocolate + Gold) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#F5EDE3]/50 border border-[#E5D9CB] rounded-2xl p-6">
              {/* Sizes Selection */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[#7A6451] block mb-2 font-semibold">
                  Available Sizes
                </label>
                <div className="flex flex-wrap gap-2 items-center">
                  {PRESET_SIZES.map((sz) => {
                    const active = selectedSizes.includes(sz);
                    return (
                      <button
                        type="button"
                        key={sz}
                        onClick={() => toggleSize(sz)}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          active
                            ? 'bg-[#23170F] text-[#E8C86A] border border-[#D4AF37] shadow-sm'
                            : 'bg-[#FDFBF7] border border-[#E5D9CB] text-[#2F1D15] hover:border-[#D4AF37]'
                        }`}
                      >
                        {sz} {active && '✓'}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-2 flex gap-2 max-w-xs">
                  <input
                    type="text"
                    value={customSize}
                    onChange={(e) => setCustomSize(e.target.value)}
                    placeholder="Add custom size"
                    className="bg-[#FDFBF7] border border-[#E5D9CB] rounded-lg px-3 py-1.5 text-xs text-[#2F1D15] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={addCustomSize}
                    className="bg-[#E5D9CB] hover:bg-[#D4AF37] text-[#2F1D15] text-xs font-bold px-3 py-1.5 rounded-lg cursor-pointer"
                  >
                    + Add
                  </button>
                </div>
              </div>

              {/* Colors Selection (NO PURPLE - Dark Chocolate + Gold checkmark as requested) */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[#7A6451] block mb-2 font-semibold">
                  Available Colors
                </label>
                <div className="flex flex-wrap gap-2 items-center">
                  {PRESET_COLORS.map((clr) => {
                    const active = selectedColors.includes(clr);
                    return (
                      <button
                        type="button"
                        key={clr}
                        onClick={() => toggleColor(clr)}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          active
                            ? 'bg-[#23170F] text-[#E8C86A] border border-[#D4AF37] shadow-sm'
                            : 'bg-[#FDFBF7] border border-[#E5D9CB] text-[#2F1D15] hover:border-[#D4AF37]'
                        }`}
                      >
                        {clr} {active && '✓'}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-2 flex gap-2 max-w-xs">
                  <input
                    type="text"
                    value={customColor}
                    onChange={(e) => setCustomColor(e.target.value)}
                    placeholder="Add custom color"
                    className="bg-[#FDFBF7] border border-[#E5D9CB] rounded-lg px-3 py-1.5 text-xs text-[#2F1D15] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={addCustomColor}
                    className="bg-[#E5D9CB] hover:bg-[#D4AF37] text-[#2F1D15] text-xs font-bold px-3 py-1.5 rounded-lg cursor-pointer"
                  >
                    + Add
                  </button>
                </div>
              </div>
            </div>

            {/* Badges Toggle */}
            <div className="flex flex-wrap gap-6 pt-2">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[#2F1D15]">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="accent-[#D4AF37] w-4 h-4 rounded cursor-pointer"
                />
                Show in Featured Drops
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[#2F1D15]">
                <input
                  type="checkbox"
                  checked={isNewArrival}
                  onChange={(e) => setIsNewArrival(e.target.checked)}
                  className="accent-[#D4AF37] w-4 h-4 rounded cursor-pointer"
                />
                Mark as New Arrival
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[#2F1D15]">
                <input
                  type="checkbox"
                  checked={isBestSeller}
                  onChange={(e) => setIsBestSeller(e.target.checked)}
                  className="accent-[#D4AF37] w-4 h-4 rounded cursor-pointer"
                />
                Mark as Best Seller
              </label>
            </div>

            {/* Image Upload / Direct URL */}
            <div className="border-t border-[#E5D9CB] pt-6 flex flex-col gap-4">
              <label className="text-xs font-bold uppercase tracking-wider text-[#7A6451] block font-semibold">
                Product Images (Upload Files or Paste Image URLs) *
              </label>

              <label className="border-2 border-dashed border-[#E5D9CB] hover:border-[#D4AF37] bg-[#F5EDE3]/50 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors group">
                <div className="w-12 h-12 rounded-full bg-[#FDFBF7] text-[#B88E28] flex items-center justify-center text-xl shadow-sm">
                  <FaCloudUploadAlt />
                </div>
                <div className="text-center">
                  <span className="text-sm font-bold text-[#2F1D15] block">Click to upload product images</span>
                  <span className="text-xs text-[#7A6451] mt-0.5 block">Supports JPG, PNG, WEBP up to 10MB</span>
                </div>
                <input
                  type="file"
                  multiple
                  accept="image/png, image/jpeg, image/webp"
                  onChange={handleImageSelect}
                  className="hidden"
                />
              </label>

              {/* Or Direct Image URL */}
              <div className="flex gap-2">
                <input
                  type="url"
                  value={directImageUrl}
                  onChange={(e) => setDirectImageUrl(e.target.value)}
                  placeholder="Or paste direct image URL (e.g. https://images.unsplash.com/...)"
                  className="flex-1 bg-[#F5EDE3]/50 border border-[#E5D9CB] rounded-xl px-4 py-2.5 text-xs text-[#2F1D15] focus:outline-none focus:border-[#D4AF37]"
                />
                <button
                  type="button"
                  onClick={handleAddDirectUrl}
                  className="bg-[#E5D9CB] hover:bg-[#D4AF37] text-[#2F1D15] text-xs font-bold px-4 py-2.5 rounded-xl cursor-pointer"
                >
                  Add URL
                </button>
              </div>

              {/* Live Image Previews */}
              {selectedImages.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 mt-2">
                  {selectedImages.map((img, i) => (
                    <div
                      key={i}
                      className="relative aspect-[3/4] bg-[#F5EDE3] border border-[#E5D9CB] rounded-xl overflow-hidden group shadow-sm"
                    >
                      <img src={img.previewUrl} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeSelectedImage(i)}
                        className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow"
                      >
                        <FaTimes />
                      </button>
                      <span className="absolute bottom-1 left-1 bg-black/70 text-[9px] px-1.5 py-0.5 rounded text-white font-mono">
                        #{i + 1} {i === 0 && '• Primary'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {uploadProgress && (
              <div className="p-3 bg-[#F5EDE3] rounded-xl border border-[#D4AF37]/50 text-xs text-[#2F1D15] flex items-center gap-2 font-semibold">
                <div className="animate-spin rounded-full h-3.5 w-3.5 border-t-2 border-b-2 border-[#D4AF37]"></div>
                {uploadProgress}
              </div>
            )}

            {/* Rule 7: Buttons: Gold with dark text */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="gold-gradient-btn w-full py-4 rounded-xl text-sm font-extrabold uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-black border-t-transparent"></div>
                  Publishing Product...
                </>
              ) : (
                <>
                  <FaPlusCircle /> Publish Product to Store
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: ALL PRODUCTS LIST                                       */}
      {/* ============================================================== */}
      {activeTab === 'products' && (
        <div className="bg-[#FDFBF7] border border-[#E5D9CB] rounded-3xl p-6 sm:p-8 flex flex-col gap-6 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-xl font-bold text-[#2F1D15] font-['Syne'] flex items-center gap-2">
                <FaBox className="text-[#B88E28]" /> Product Catalog ({products.length})
              </h2>
              <p className="text-xs text-[#7A6451] mt-0.5">Manage live streetwear drops, pricing & inventory</p>
            </div>

            <div className="relative w-full sm:w-64">
              <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7A6451] text-xs" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#F5EDE3]/50 border border-[#E5D9CB] rounded-xl pl-9 pr-4 py-2 text-xs text-[#2F1D15] focus:outline-none focus:border-[#D4AF37]"
              />
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="text-center py-16 text-[#7A6451]">
              <p className="text-sm font-medium">No products match your search or no products added yet.</p>
              <button
                onClick={() => setActiveTab('create')}
                className="mt-3 text-xs font-bold text-[#B88E28] underline cursor-pointer"
              >
                + Add your first product now
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#E5D9CB] text-[#7A6451] font-bold uppercase tracking-wider">
                    <th className="pb-3 pl-2">Product</th>
                    <th className="pb-3">Category</th>
                    <th className="pb-3">Price</th>
                    <th className="pb-3">Stock</th>
                    <th className="pb-3">Badges</th>
                    <th className="pb-3 text-right pr-2">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5D9CB]">
                  {filteredProducts.map((p) => {
                    const imgUrl = p.images?.[0]?.url || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=100';
                    const catObj = categories.find((c) => c._id === p.category || c.id === p.category);
                    return (
                      <tr key={p._id} className="hover:bg-[#F5EDE3]/40 transition-colors">
                        <td className="py-3 pl-2 flex items-center gap-3">
                          <img src={imgUrl} alt="" className="w-12 h-14 object-cover rounded-lg bg-[#F5EDE3] border border-[#E5D9CB]" />
                          <div>
                            <span className="font-bold text-[#2F1D15] block text-sm line-clamp-1">{p.name}</span>
                            <span className="text-[10px] text-[#7A6451] font-mono">ID: {p._id.slice(-6)}</span>
                          </div>
                        </td>
                        <td className="py-3 text-[#7A6451] font-semibold">{catObj?.name || 'Standard'}</td>
                        <td className="py-3">
                          <div className="flex items-baseline gap-1.5">
                            <span className="font-bold text-[#2F1D15]">₹{p.discountPrice || p.price}</span>
                            {p.discountPrice > 0 && (
                              <span className="text-[10px] text-[#8C7765] line-through">₹{p.price}</span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 font-semibold text-[#2F1D15]">{p.stock} units</td>
                        <td className="py-3">
                          <div className="flex flex-wrap gap-1">
                            {p.isFeatured && (
                              <span className="bg-[#C6A15B] text-[#23170F] text-[9px] font-bold px-1.5 py-0.5 rounded">
                                Featured
                              </span>
                            )}
                            {p.isNewArrival && (
                              <span className="bg-[#23170F] text-[#E8C86A] text-[9px] font-bold px-1.5 py-0.5 rounded">
                                New
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 text-right pr-2">
                          <button
                            onClick={() => handleDeleteProduct(p._id)}
                            className="p-2 text-red-500 hover:text-red-700 transition-colors cursor-pointer"
                            title="Delete Product"
                          >
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: CUSTOMER ORDERS LIST                                    */}
      {/* ============================================================== */}
      {activeTab === 'orders' && (
        <div className="bg-[#FDFBF7] border border-[#E5D9CB] rounded-3xl p-6 sm:p-8 flex flex-col gap-6 shadow-sm">
          <div>
            <h2 className="text-xl font-bold text-[#2F1D15] font-['Syne'] flex items-center gap-2">
              <FaShoppingBag className="text-emerald-600" /> WhatsApp Orders ({orders.length})
            </h2>
            <p className="text-xs text-[#7A6451] mt-0.5">Manage customer orders placed via WhatsApp & Checkout</p>
          </div>

          {orders.length === 0 ? (
            <div className="text-center py-16 text-[#7A6451]">
              <p className="text-sm font-medium">No customer orders recorded yet.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {orders.map((o) => (
                <div
                  key={o.id || o._id}
                  className="bg-[#F5EDE3]/60 border border-[#E5D9CB] rounded-2xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                >
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-[#2F1D15] text-sm">#{o.order_number || o._id}</span>
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-[#E5D9CB] text-[#2F1D15]">
                        {o.status || 'Pending'}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-[#2F1D15]">
                      Customer: {o.customer_name} ({o.customer_phone})
                    </span>
                    <span className="text-[11px] text-[#7A6451]">
                      Address: {o.address}, {o.city} - {o.pincode}
                    </span>
                  </div>

                  <div className="text-right flex flex-col items-end gap-2">
                    <span className="text-lg font-black text-[#2F1D15]">₹{o.total_price || o.totalPrice}</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdateOrderStatus(o.id || o._id, 'confirmed')}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg cursor-pointer"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => handleUpdateOrderStatus(o.id || o._id, 'shipped')}
                        className="bg-[#23170F] hover:bg-[#38241A] text-[#E8C86A] text-xs font-bold px-3 py-1.5 rounded-lg cursor-pointer"
                      >
                        Mark Shipped
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 4: WHATSAPP & STORE SETTINGS                               */}
      {/* ============================================================== */}
      {activeTab === 'settings' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* General WhatsApp & UPI Settings */}
          <div className="bg-[#FDFBF7] border border-[#E5D9CB] rounded-3xl p-6 sm:p-8 flex flex-col gap-6 shadow-sm">
            <div>
              <h2 className="text-xl font-bold text-[#2F1D15] font-['Syne'] flex items-center gap-2">
                <FaWhatsapp className="text-emerald-600" /> WhatsApp & Store Setup
              </h2>
              <p className="text-xs text-[#7A6451] mt-1">
                Configure your WhatsApp phone number and GPay/PhonePe UPI ID.
              </p>
            </div>

            <form onSubmit={handleSaveSettings} className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[#7A6451] block mb-2 font-semibold">
                  Admin WhatsApp Phone Number *
                </label>
                <input
                  type="text"
                  required
                  value={whatsappNumberInput}
                  onChange={(e) => setWhatsappNumberInput(e.target.value)}
                  placeholder="e.g. 919876543210"
                  className="w-full bg-[#F5EDE3]/50 border border-[#E5D9CB] rounded-xl px-4 py-2.5 text-sm text-[#2F1D15] focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[#7A6451] block mb-2 font-semibold">
                  Store UPI ID (GPay / PhonePe / Paytm)
                </label>
                <input
                  type="text"
                  value={upiIdInput}
                  onChange={(e) => setUpiIdInput(e.target.value)}
                  placeholder="e.g. yourname@okhdfcbank"
                  className="w-full bg-[#F5EDE3]/50 border border-[#E5D9CB] rounded-xl px-4 py-2.5 text-sm text-[#2F1D15] focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[#7A6451] block mb-2 font-semibold">
                  Store Brand Name
                </label>
                <input
                  type="text"
                  value={storeNameInput}
                  onChange={(e) => setStoreNameInput(e.target.value)}
                  placeholder="Bro Fusion"
                  className="w-full bg-[#F5EDE3]/50 border border-[#E5D9CB] rounded-xl px-4 py-2.5 text-sm text-[#2F1D15] focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <button
                type="submit"
                className="gold-gradient-btn w-full py-3.5 rounded-xl text-xs uppercase tracking-wider font-extrabold cursor-pointer shadow-md mt-2"
              >
                Save Store Settings
              </button>
            </form>
          </div>

          {/* Supabase Configuration Box */}
          <div className="bg-[#FDFBF7] border border-[#E5D9CB] rounded-3xl p-6 sm:p-8 flex flex-col gap-6 shadow-sm">
            <div>
              <h2 className="text-xl font-bold text-[#2F1D15] font-['Syne'] flex items-center gap-2">
                ⚡ Supabase Backend Connection
              </h2>
              <p className="text-xs text-[#7A6451] mt-1">
                Paste your Supabase Project URL & Anon Key to sync database and image uploads in real-time.
              </p>
            </div>

            <form onSubmit={handleSaveSupabaseConfig} className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[#7A6451] block mb-2 font-semibold">
                  Supabase Project URL
                </label>
                <input
                  type="url"
                  value={supabaseUrlInput}
                  onChange={(e) => setSupabaseUrlInput(e.target.value)}
                  placeholder="https://xyzcompany.supabase.co"
                  className="w-full bg-[#F5EDE3]/50 border border-[#E5D9CB] rounded-xl px-4 py-2.5 text-xs text-[#2F1D15] focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[#7A6451] block mb-2 font-semibold">
                  Supabase Anon Key
                </label>
                <textarea
                  rows="3"
                  value={supabaseKeyInput}
                  onChange={(e) => setSupabaseKeyInput(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  className="w-full bg-[#F5EDE3]/50 border border-[#E5D9CB] rounded-xl p-3 text-xs text-[#2F1D15] focus:outline-none focus:border-[#D4AF37] font-mono resize-none"
                ></textarea>
              </div>

              <button
                type="submit"
                className="bg-[#23170F] hover:bg-[#38241A] text-[#E8C86A] border border-[#D4AF37]/50 w-full py-3.5 rounded-xl uppercase tracking-wider text-xs font-extrabold cursor-pointer shadow-md"
              >
                Connect Supabase
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
