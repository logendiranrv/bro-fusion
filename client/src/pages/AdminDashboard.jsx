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

export default function AdminDashboard() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { settings } = useSelector((state) => state.settings || { settings: {} });

  // Passcode unlock state (allows store owner to manage without login obstacles)
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(
    () => user?.role === 'admin' || localStorage.getItem('bro_admin_auth') === 'true'
  );
  const [passcode, setPasscode] = useState('');

  // Active Tab: 'products' | 'create' | 'orders' | 'categories' | 'settings'
  const [activeTab, setActiveTab] = useState('create');

  // Loading states
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');

  // Data states
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Form states for New Product
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [discountPrice, setDiscountPrice] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [selectedSizes, setSelectedSizes] = useState(['S', 'M', 'L', 'XL']);
  const [customSize, setCustomSize] = useState('');
  const [selectedColors, setSelectedColors] = useState(['Black', 'White']);
  const [customColor, setCustomColor] = useState('');
  const [stock, setStock] = useState('20');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isNewArrival, setIsNewArrival] = useState(true);
  const [isBestSeller, setIsBestSeller] = useState(false);

  // Images state (files + live previews)
  const [selectedImages, setSelectedImages] = useState([]); // array of { file, previewUrl, isDirectUrl }
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

  // Fetch all dashboard data
  const fetchData = async () => {
    try {
      setLoading(true);

      if (supabaseActive) {
        // Fetch from Supabase
        const [prodData, catData, ordersData, settingsData] = await Promise.all([
          supabaseGetProducts().catch(() => []),
          supabaseGetCategories().catch(() => []),
          supabaseGetOrders().catch(() => []),
          supabaseGetSettings().catch(() => ({})),
        ]);
        setProducts(prodData);
        setCategories(catData);
        setOrders(ordersData);
        if (catData.length > 0 && !category) setCategory(catData[0]._id);
        if (settingsData.whatsappNumber) setWhatsappNumberInput(settingsData.whatsappNumber);
        if (settingsData.upiId) setUpiIdInput(settingsData.upiId);
      } else {
        // Fallback to Express API
        const [prodRes, catRes, ordersRes] = await Promise.all([
          api.get('/products').catch(() => ({ data: { products: [] } })),
          api.get('/categories').catch(() => ({ data: { categories: [] } })),
          api.get('/orders').catch(() => ({ data: { orders: [] } })),
        ]);
        setProducts(prodRes.data.products || []);
        setCategories(catRes.data.categories || []);
        setOrders(ordersRes.data.orders || []);
        if (catRes.data.categories?.length > 0 && !category) {
          setCategory(catRes.data.categories[0]._id);
        }
      }
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdminUnlocked) {
      fetchData();
      dispatch(fetchSettings());
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
    e.target.value = ''; // Reset input
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
    setUploadProgress(`Uploading ${selectedImages.length} image(s)...`);

    try {
      // 1. Process & Upload images
      const uploadedImages = [];
      for (let i = 0; i < selectedImages.length; i++) {
        setUploadProgress(`Uploading image ${i + 1} of ${selectedImages.length}...`);
        const item = selectedImages[i];
        if (item.isDirectUrl || !item.file) {
          uploadedImages.push({ url: item.previewUrl, publicId: '' });
        } else {
          const res = await uploadImageFile(item.file, 'products');
          uploadedImages.push({ url: res.url, publicId: res.path || '' });
        }
      }

      setUploadProgress('Saving product to database...');

      const productPayload = {
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
      };

      // 2. Save in Supabase or API
      if (supabaseActive) {
        await supabaseCreateProduct(productPayload);
      } else {
        await api.post('/products', productPayload);
      }

      toast.success('🎉 Product added successfully!');

      // Reset form
      setName('');
      setPrice('');
      setDiscountPrice('');
      setDescription('');
      setSelectedImages([]);
      setUploadProgress('');
      fetchData();
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
      if (supabaseActive) {
        await supabaseDeleteProduct(id);
      } else {
        await api.delete(`/products/${id}`);
      }
      toast.success('Product deleted');
      fetchData();
    } catch (err) {
      toast.error(err.message || 'Failed to delete product');
    }
  };

  // CREATE CATEGORY HANDLER
  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    try {
      if (supabaseActive) {
        const cat = await supabaseCreateCategory(newCategoryName.trim());
        setCategories((prev) => [...prev, cat]);
        if (!category) setCategory(cat._id);
      } else {
        const res = await api.post('/categories', { name: newCategoryName.trim() });
        setCategories((prev) => [...prev, res.data.category]);
        if (!category) setCategory(res.data.category._id);
      }
      toast.success('Category created!');
      setNewCategoryName('');
      fetchData();
    } catch (err) {
      toast.error(err.message || 'Failed to create category');
    }
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

  // SAVE SETTINGS HANDLER
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      const cleanPhone = sanitizeWhatsAppNumber(whatsappNumberInput);
      if (supabaseActive) {
        await supabaseUpdateSetting('whatsappNumber', cleanPhone);
        await supabaseUpdateSetting('upiId', upiIdInput);
        await supabaseUpdateSetting('storeName', storeNameInput);
      } else {
        await dispatch(updateSetting({ key: 'whatsappNumber', value: cleanPhone })).unwrap();
        await dispatch(updateSetting({ key: 'upiId', value: upiIdInput })).unwrap();
        await dispatch(updateSetting({ key: 'storeName', value: storeNameInput })).unwrap();
      }
      toast.success('Settings saved successfully!');
    } catch (err) {
      toast.error(err.message || 'Failed to update settings');
    }
  };

  // LOGO UPLOAD HANDLER
  const handleLogoUpload = async (e) => {
    e.preventDefault();
    if (!logoFile) return toast.error('Please choose a logo image first');
    setIsUploadingLogo(true);
    try {
      const res = await uploadImageFile(logoFile, 'products');
      if (supabaseActive) {
        await supabaseUpdateSetting('logoUrl', res.url);
      } else {
        await dispatch(updateSetting({ key: 'logoUrl', value: res.url })).unwrap();
      }
      toast.success('Store logo updated!');
      setLogoFile(null);
    } catch (err) {
      toast.error(err.message || 'Failed to upload logo');
    } finally {
      setIsUploadingLogo(false);
    }
  };

  // PASSCODE LOCK SCREEN
  if (!isAdminUnlocked) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 max-w-md w-full text-center flex flex-col items-center gap-6 shadow-2xl">
          <div className="w-16 h-16 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center text-3xl">
            <FaLock />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">Bro Fusion Admin</h1>
            <p className="text-zinc-400 text-xs mt-1">
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
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-center text-sm font-bold tracking-widest text-zinc-200 focus:outline-none focus:border-amber-500"
            />
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-amber-500 to-purple-600 hover:from-amber-600 hover:to-purple-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg cursor-pointer text-sm"
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
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-black text-white">Admin Management</h1>
            <span
              className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                supabaseActive
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
              }`}
            >
              {supabaseActive ? '⚡ Supabase Active' : '🖥️ Express API'}
            </span>
          </div>
          <p className="text-zinc-400 text-xs sm:text-sm mt-1">
            Add products with image uploads, manage WhatsApp orders & site settings.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={`https://wa.me/${sanitizeWhatsAppNumber(whatsappNumberInput)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all cursor-pointer"
          >
            <FaWhatsapp className="text-base" /> WhatsApp: {whatsappNumberInput}
          </a>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-zinc-800 pb-3">
        <button
          onClick={() => setActiveTab('create')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer ${
            activeTab === 'create'
              ? 'bg-gradient-to-r from-amber-500 to-purple-600 text-white shadow-lg'
              : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-850 border border-zinc-800'
          }`}
        >
          <FaPlusCircle /> Add New Product
        </button>

        <button
          onClick={() => setActiveTab('products')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer ${
            activeTab === 'products'
              ? 'bg-gradient-to-r from-amber-500 to-purple-600 text-white shadow-lg'
              : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-850 border border-zinc-800'
          }`}
        >
          <FaBox /> All Products ({products.length})
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer ${
            activeTab === 'orders'
              ? 'bg-gradient-to-r from-amber-500 to-purple-600 text-white shadow-lg'
              : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-850 border border-zinc-800'
          }`}
        >
          <FaShoppingBag /> Customer Orders ({orders.length})
        </button>

        <button
          onClick={() => setActiveTab('categories')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer ${
            activeTab === 'categories'
              ? 'bg-gradient-to-r from-amber-500 to-purple-600 text-white shadow-lg'
              : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-850 border border-zinc-800'
          }`}
        >
          <FaTags /> Categories ({categories.length})
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer ${
            activeTab === 'settings'
              ? 'bg-gradient-to-r from-amber-500 to-purple-600 text-white shadow-lg'
              : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-850 border border-zinc-800'
          }`}
        >
          <FaCog /> WhatsApp & Store Settings
        </button>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: ADD NEW PRODUCT FORM                                   */}
      {/* ============================================================== */}
      {activeTab === 'create' && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 sm:p-10 shadow-xl">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <FaPlusCircle className="text-amber-500" /> Create New Apparel / Product
            </h2>
            <p className="text-xs text-zinc-400 mt-1">
              Add your clothing item with images, sizes, colors and pricing.
            </p>
          </div>

          <form onSubmit={handleCreateProduct} className="flex flex-col gap-6">
            {/* Title & Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 block mb-2">
                  Product Title *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Acid Wash Heavyweight Oversized Tee"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 block mb-2">
                  Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-200 focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  {categories.length === 0 ? (
                    <option value="">No categories - Create one in Categories tab first</option>
                  ) : (
                    categories.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))
                  )}
                </select>
              </div>
            </div>

            {/* Pricing & Stock */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 block mb-2">
                  MRP / Original Price (₹) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="e.g. 999"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 block mb-2">
                  Selling / Discount Price (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  value={discountPrice}
                  onChange={(e) => setDiscountPrice(e.target.value)}
                  placeholder="e.g. 699 (leave blank if no discount)"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 block mb-2">
                  Stock Quantity *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  placeholder="e.g. 25"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-200 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 block mb-2">
                Product Description *
              </label>
              <textarea
                required
                rows="4"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Details about 240 GSM 100% French Terry cotton, drop shoulder fit, pre-shrunk fabric, wash care instructions..."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-sm text-zinc-200 focus:outline-none focus:border-amber-500 resize-none leading-relaxed"
              ></textarea>
            </div>

            {/* Sizes Selection */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 block mb-2">
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
                          ? 'bg-amber-500 text-black shadow-md'
                          : 'bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-white'
                      }`}
                    >
                      {sz} {active && '✓'}
                    </button>
                  );
                })}
              </div>

              {/* Custom Size Adder */}
              <div className="mt-2 flex gap-2 max-w-xs">
                <input
                  type="text"
                  value={customSize}
                  onChange={(e) => setCustomSize(e.target.value)}
                  placeholder="Add custom size (e.g. 32, 34)"
                  className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-300 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={addCustomSize}
                  className="bg-zinc-800 hover:bg-zinc-700 text-white text-xs px-3 py-1.5 rounded-lg cursor-pointer"
                >
                  + Add
                </button>
              </div>
            </div>

            {/* Colors Selection */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 block mb-2">
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
                          ? 'bg-purple-600 text-white shadow-md'
                          : 'bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-white'
                      }`}
                    >
                      {clr} {active && '✓'}
                    </button>
                  );
                })}
              </div>

              {/* Custom Color Adder */}
              <div className="mt-2 flex gap-2 max-w-xs">
                <input
                  type="text"
                  value={customColor}
                  onChange={(e) => setCustomColor(e.target.value)}
                  placeholder="Add custom color"
                  className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-300 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={addCustomColor}
                  className="bg-zinc-800 hover:bg-zinc-700 text-white text-xs px-3 py-1.5 rounded-lg cursor-pointer"
                >
                  + Add
                </button>
              </div>
            </div>

            {/* Badges / Visibility checkboxes */}
            <div className="flex flex-wrap gap-6 pt-2">
              <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isNewArrival}
                  onChange={(e) => setIsNewArrival(e.target.checked)}
                  className="accent-amber-500 rounded cursor-pointer"
                />
                <span>🔥 New Arrival</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="accent-amber-500 rounded cursor-pointer"
                />
                <span>⭐ Featured Product</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isBestSeller}
                  onChange={(e) => setIsBestSeller(e.target.checked)}
                  className="accent-amber-500 rounded cursor-pointer"
                />
                <span>🏆 Best Seller</span>
              </label>
            </div>

            {/* Image Upload & Previews (Supabase Storage / URL) */}
            <div className="border-t border-[#202434] pt-6 flex flex-col gap-4">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 block">
                Product Images *
              </label>

              {/* Upload Drop area */}
              <label className="border-2 border-dashed border-[#202434] hover:border-amber-400/60 bg-[#08090D] rounded-2xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors group">
                <div className="w-12 h-12 rounded-full bg-[#10121A] group-hover:bg-amber-500/10 text-zinc-400 group-hover:text-amber-400 flex items-center justify-center text-xl transition-colors">
                  <FaCloudUploadAlt />
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-white">Click or drag images here to upload</p>
                  <p className="text-xs text-zinc-500 mt-0.5">Supports PNG, JPG, WEBP (Multiple images allowed)</p>
                </div>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
              </label>

              {/* OR Enter Direct Image URL */}
              <div className="flex gap-2">
                <input
                  type="url"
                  value={directImageUrl}
                  onChange={(e) => setDirectImageUrl(e.target.value)}
                  placeholder="Or paste an image web link (https://...)"
                  className="flex-1 bg-[#08090D] border border-[#202434] rounded-xl px-4 py-2.5 text-xs text-zinc-200 focus:outline-none focus:border-amber-400"
                />
                <button
                  type="button"
                  onClick={handleAddDirectUrl}
                  className="bg-[#161924] hover:bg-[#202434] text-white text-xs font-bold px-4 py-2.5 rounded-xl border border-[#202434] cursor-pointer"
                >
                  + Add URL
                </button>
              </div>

              {/* Live Image Previews with Remove button */}
              {selectedImages.length > 0 && (
                <div className="mt-2">
                  <p className="text-xs text-zinc-400 font-semibold mb-2">
                    {selectedImages.length} image(s) selected:
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                    {selectedImages.map((img, idx) => (
                      <div
                        key={idx}
                        className="relative aspect-[3/4] bg-[#08090D] border border-[#202434] rounded-xl overflow-hidden group"
                      >
                        <img
                          src={img.previewUrl}
                          alt="preview"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeSelectedImage(idx)}
                          className="absolute top-1.5 right-1.5 w-6 h-6 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center text-xs shadow-lg transition-transform hover:scale-110 cursor-pointer"
                          title="Remove image"
                        >
                          <FaTimes />
                        </button>
                        <span className="absolute bottom-1 left-1 bg-black/70 text-[9px] px-1.5 py-0.5 rounded text-white font-mono">
                          #{idx + 1}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Upload Progress Status */}
            {uploadProgress && (
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-400 font-bold flex items-center gap-2 animate-pulse">
                <span>⏳</span> {uploadProgress}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-amber-500 to-purple-600 hover:from-amber-600 hover:to-purple-700 disabled:opacity-50 text-white font-black py-4 rounded-xl text-base shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <FaPlusCircle />
              {isSubmitting ? 'Uploading & Creating Product...' : 'Publish Product to Store'}
            </button>
          </form>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: ALL PRODUCTS LIST                                      */}
      {/* ============================================================== */}
      {activeTab === 'products' && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 sm:p-8 flex flex-col gap-6 shadow-xl">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-xl font-bold text-white">Active Products Catalog</h2>
              <p className="text-xs text-zinc-400">Total {products.length} products listed in your store</p>
            </div>

            <div className="relative w-full sm:w-64">
              <FaSearch className="absolute left-3 top-3 text-zinc-500 text-xs" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs text-zinc-200 focus:outline-none"
              />
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="text-center py-12 text-zinc-500 text-sm">
              No products found. Click "Add New Product" to list your first apparel item!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProducts.map((p) => {
                const imgUrl = p.images?.[0]?.url || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500';
                return (
                  <div
                    key={p._id}
                    className="bg-zinc-950 border border-zinc-800/80 rounded-xl p-4 flex gap-4 items-center group hover:border-zinc-700 transition-all"
                  >
                    <img
                      src={imgUrl}
                      alt={p.name}
                      className="w-16 h-20 object-cover rounded-lg bg-zinc-900 border border-zinc-800 flex-shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-sm text-white truncate">{p.name}</h3>
                      <p className="text-xs text-amber-400 font-bold mt-0.5">
                        ₹{p.discountPrice > 0 ? p.discountPrice : p.price}
                        {p.discountPrice > 0 && (
                          <span className="text-zinc-500 line-through ml-2 text-[11px]">
                            ₹{p.price}
                          </span>
                        )}
                      </p>
                      <p className="text-[11px] text-zinc-400 mt-1">
                        Stock: <span className="text-zinc-200 font-semibold">{p.stock}</span> | Photos: {p.images?.length || 0}
                      </p>
                    </div>

                    <button
                      onClick={() => handleDeleteProduct(p._id)}
                      className="text-zinc-500 hover:text-red-500 p-2 rounded-lg hover:bg-zinc-900 transition-colors cursor-pointer"
                      title="Delete Product"
                    >
                      <FaTrash />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: CUSTOMER ORDERS (WhatsApp Management)                   */}
      {/* ============================================================== */}
      {activeTab === 'orders' && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 sm:p-8 flex flex-col gap-6 shadow-xl">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <FaShoppingBag className="text-amber-500" /> Customer WhatsApp Orders
            </h2>
            <p className="text-xs text-zinc-400 mt-1">
              View orders received through your website and message customers directly on WhatsApp!
            </p>
          </div>

          {orders.length === 0 ? (
            <p className="text-zinc-500 text-sm italic py-12 text-center">
              No orders placed yet. Orders will appear here as soon as customers checkout!
            </p>
          ) : (
            <div className="flex flex-col gap-4">
              {orders.map((o) => {
                const customerPhone = o.customer?.phone || o.shippingAddress?.phone || '';
                const customerName = o.customer?.name || o.shippingAddress?.name || 'Customer';
                const cleanPhone = sanitizeWhatsAppNumber(customerPhone);
                const chatText = encodeURIComponent(
                  `Hi ${customerName}! 👋 Thank you for ordering from Bro Fusion (Order #${o.orderNumber || o._id}). We have received your order details and are preparing it!`
                );
                const waChatUrl = `https://wa.me/${cleanPhone}?text=${chatText}`;

                return (
                  <div
                    key={o._id}
                    className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 flex flex-col gap-4"
                  >
                    <div className="flex flex-wrap justify-between items-center gap-2 border-b border-zinc-800/80 pb-3">
                      <div>
                        <span className="text-[10px] text-zinc-500 uppercase font-bold">Order ID</span>
                        <p className="text-sm font-bold text-white">#{o.orderNumber || o._id}</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-zinc-500 uppercase font-bold">Customer</span>
                        <p className="text-sm font-semibold text-zinc-200">
                          {customerName} ({customerPhone})
                        </p>
                      </div>
                      <div>
                        <span className="text-[10px] text-zinc-500 uppercase font-bold">Bill Total</span>
                        <p className="text-sm font-black text-amber-400">₹{o.totalPrice}</p>
                      </div>

                      {/* Direct WhatsApp Chat with Customer */}
                      {customerPhone && (
                        <a
                          href={waChatUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1.5 cursor-pointer shadow transition-all"
                        >
                          <FaWhatsapp className="text-base" /> Chat on WhatsApp
                        </a>
                      )}
                    </div>

                    {/* Ordered Items */}
                    <div className="text-xs text-zinc-400 flex flex-col gap-1">
                      <span className="font-bold text-zinc-300">Items:</span>
                      {o.orderItems?.map((it, idx) => (
                        <div key={idx} className="flex justify-between items-center">
                          <span>
                            • {it.name} (x{it.quantity}) {it.size ? `| Size: ${it.size}` : ''}
                          </span>
                          <span className="font-semibold text-zinc-200">₹{it.price * it.quantity}</span>
                        </div>
                      ))}
                    </div>

                    {/* Delivery Address */}
                    <div className="text-xs bg-zinc-900/60 p-3 rounded-lg text-zinc-400">
                      <span className="font-bold text-zinc-300">Address: </span>
                      {o.shippingAddress?.address}, {o.shippingAddress?.city}, {o.shippingAddress?.state} - {o.shippingAddress?.pincode}
                    </div>

                    {/* Status updater */}
                    <div className="flex flex-wrap items-center gap-3 pt-2">
                      <span className="text-xs font-bold text-zinc-400">Status:</span>
                      {['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].map((st) => (
                        <button
                          key={st}
                          onClick={() => handleUpdateOrderStatus(o._id, st)}
                          className={`text-xs px-3 py-1 rounded-md font-bold uppercase transition-all cursor-pointer ${
                            o.status === st
                              ? 'bg-amber-500 text-black shadow'
                              : 'bg-zinc-900 text-zinc-500 hover:text-white border border-zinc-800'
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 4: CATEGORIES MANAGEMENT                                   */}
      {/* ============================================================== */}
      {activeTab === 'categories' && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 sm:p-8 flex flex-col gap-6 shadow-xl">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <FaTags className="text-purple-400" /> Categories Management
            </h2>
            <p className="text-xs text-zinc-400 mt-1">
              Add new categories for organizing your apparel products.
            </p>
          </div>

          {/* Add Category Form */}
          <form onSubmit={handleCreateCategory} className="flex gap-3 max-w-md">
            <input
              type="text"
              required
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="e.g. Graphic Tees, Hoodies, Cargos"
              className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-amber-500"
            />
            <button
              type="submit"
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-all cursor-pointer shadow"
            >
              + Add
            </button>
          </form>

          {/* Categories List */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-2">
            {categories.map((c) => (
              <div
                key={c._id}
                className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 flex flex-col justify-between"
              >
                <span className="font-bold text-white text-sm">{c.name}</span>
                <span className="text-[11px] text-zinc-500 mt-1">slug: {c.slug}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 5: WHATSAPP & STORE SETTINGS                               */}
      {/* ============================================================== */}
      {activeTab === 'settings' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* General WhatsApp & UPI Settings */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 sm:p-8 flex flex-col gap-6 shadow-xl">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <FaWhatsapp className="text-emerald-500" /> WhatsApp & Store Setup
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                Configure your WhatsApp phone number and GPay/PhonePe UPI ID.
              </p>
            </div>

            <form onSubmit={handleSaveSettings} className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 block mb-2">
                  Admin WhatsApp Phone Number *
                </label>
                <input
                  type="text"
                  required
                  value={whatsappNumberInput}
                  onChange={(e) => setWhatsappNumberInput(e.target.value)}
                  placeholder="e.g. 919876543210"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-amber-500"
                />
                <span className="text-[11px] text-zinc-500 mt-1 block">
                  All website orders and floating chat messages will be sent to this WhatsApp number.
                </span>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 block mb-2">
                  Store UPI ID (GPay / PhonePe / Paytm)
                </label>
                <input
                  type="text"
                  value={upiIdInput}
                  onChange={(e) => setUpiIdInput(e.target.value)}
                  placeholder="e.g. yourname@okhdfcbank"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-amber-500"
                />
                <span className="text-[11px] text-zinc-500 mt-1 block">
                  Displayed on the checkout screen so customers can instantly pay.
                </span>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 block mb-2">
                  Store Brand Name
                </label>
                <input
                  type="text"
                  value={storeNameInput}
                  onChange={(e) => setStoreNameInput(e.target.value)}
                  placeholder="Bro Fusion"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg cursor-pointer text-sm mt-2"
              >
                Save Store Settings
              </button>
            </form>
          </div>

          {/* Logo Upload */}
          <div className="bg-[#10121A] border border-[#202434] rounded-2xl p-6 sm:p-8 flex flex-col gap-6 shadow-xl">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <FaCog className="text-amber-400" /> Site Logo
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                Upload your brand logo PNG to display on the header and tab icon.
              </p>
            </div>

            <form onSubmit={handleLogoUpload} className="flex flex-col gap-4">
              {settings?.logoUrl && (
                <div className="bg-[#08090D] p-4 rounded-xl border border-[#202434] flex justify-center items-center">
                  <img src={settings.logoUrl} alt="Logo" className="h-14 w-auto object-contain" />
                </div>
              )}

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 block mb-2">
                  Select Logo File
                </label>
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  onChange={(e) => setLogoFile(e.target.files[0])}
                  className="w-full bg-[#08090D] border border-[#202434] rounded-xl px-4 py-2.5 text-xs text-zinc-300 cursor-pointer focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isUploadingLogo || !logoFile}
                className="gold-gradient-btn w-full py-3.5 rounded-xl uppercase tracking-wider text-xs cursor-pointer shadow-lg disabled:opacity-50"
              >
                {isUploadingLogo ? 'Uploading Logo...' : 'Upload & Update Logo'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
