import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { FaTrash, FaPlusCircle } from 'react-icons/fa';
import { updateSetting } from '../store/slices/settingsSlice';

function AdminOrderCard({ order, onUpdate }) {
  const [status, setStatus] = useState(order.status);
  const [courier, setCourier] = useState(order.courierService || '');
  const [trackingId, setTrackingId] = useState(order.trackingId || '');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    await onUpdate(order._id, status, courier, trackingId);
    setIsUpdating(false);
  };

  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-6 flex flex-col gap-4">
      {/* Header Info */}
      <div className="flex flex-wrap justify-between items-center border-b border-zinc-800 pb-3 gap-4">
        <div>
          <span className="text-[10px] text-zinc-500 uppercase font-bold block">Order ID</span>
          <p className="text-sm font-bold text-white">#{order._id}</p>
        </div>
        <div>
          <span className="text-[10px] text-zinc-500 uppercase font-bold block">Customer</span>
          <p className="text-sm font-semibold text-zinc-300">{order.user?.name} ({order.user?.email})</p>
        </div>
        <div>
          <span className="text-[10px] text-zinc-500 uppercase font-bold block">Date</span>
          <p className="text-sm text-zinc-400">{new Date(order.createdAt).toLocaleString()}</p>
        </div>
        <div>
          <span className="text-[10px] text-zinc-500 uppercase font-bold block">Total Price</span>
          <p className="text-sm font-black text-emerald-400">₹{order.totalPrice}</p>
        </div>
      </div>

      {/* Items list */}
      <div className="flex flex-col gap-2">
        <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Items ({order.orderItems?.length})</span>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {order.orderItems?.map((item, idx) => (
            <div key={idx} className="flex gap-3 items-center bg-zinc-900/50 p-2 rounded border border-zinc-800/45">
              <img src={item.image} alt="" className="w-8 h-10 object-cover rounded bg-zinc-950 border border-zinc-800" />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-white truncate">{item.name}</p>
                <p className="text-[10px] text-zinc-400">Qty: {item.quantity} | Size: {item.size} | Color: {item.color}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Shipping Address */}
      <div className="text-xs text-zinc-400 bg-zinc-900/40 p-4 rounded border border-zinc-800/60">
        <p className="font-bold text-zinc-300">Shipping Details:</p>
        <p className="mt-1">{order.shippingAddress?.name} | {order.shippingAddress?.phone}</p>
        <p>{order.shippingAddress?.address}, {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}</p>
      </div>

      {/* Status Editor Form */}
      <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-4 border-t border-zinc-800 pt-3">
        <div className="flex-grow min-w-[150px]">
          <label className="text-[10px] text-zinc-400 block mb-1 uppercase font-bold">Order Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-zinc-700 cursor-pointer"
          >
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {status === 'shipped' && (
          <>
            <div className="flex-grow min-w-[150px]">
              <label className="text-[10px] text-zinc-400 block mb-1 uppercase font-bold">Courier Service</label>
              <input
                type="text"
                required
                value={courier}
                onChange={(e) => setCourier(e.target.value)}
                placeholder="Courier Service"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-zinc-700"
              />
            </div>
            <div className="flex-grow min-w-[150px]">
              <label className="text-[10px] text-zinc-400 block mb-1 uppercase font-bold">Tracking ID</label>
              <input
                type="text"
                required
                value={trackingId}
                onChange={(e) => setTrackingId(e.target.value)}
                placeholder="Tracking ID"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-zinc-700"
              />
            </div>
          </>
        )}

        <button
          type="submit"
          disabled={isUpdating}
          className="bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-black text-xs font-bold py-2.5 px-4 rounded-lg cursor-pointer transition-colors border-0 shadow"
        >
          {isUpdating ? 'Updating...' : 'Update Status'}
        </button>
      </form>
    </div>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { settings } = useSelector((state) => state.settings || { settings: {} });
  const logoUrl = settings?.logoUrl;

  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Logo upload state
  const [logoFile, setLogoFile] = useState(null);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

  // New product form states
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [discountPrice, setDiscountPrice] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [sizes, setSizes] = useState('S,M,L,XL');
  const [colors, setColors] = useState('Black,White');
  const [stock, setStock] = useState('10');
  const [imageFiles, setImageFiles] = useState([]);
  const [isCreatingProduct, setIsCreatingProduct] = useState(false);
  const [orders, setOrders] = useState([]);

  // New category form state
  const [newCategoryName, setNewCategoryName] = useState('');

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      toast.error('Access Denied: Admins Only');
      navigate('/');
    }
  }, [user, navigate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, prodRes, catRes, ordersRes] = await Promise.all([
        api.get('/orders/stats'),
        api.get('/products'),
        api.get('/categories'),
        api.get('/orders'),
      ]);
      setStats(statsRes.data.stats);
      setProducts(prodRes.data.products);
      setCategories(catRes.data.categories);
      setOrders(ordersRes.data.orders);
      if (catRes.data.categories.length > 0) {
        setCategory(catRes.data.categories[0]._id);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch admin dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    try {
      const response = await api.post('/categories', { name: newCategoryName });
      if (response.data.success) {
        toast.success('Category created!');
        setNewCategoryName('');
        fetchData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create category');
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    if (!category) {
      toast.error('Please create and select a category first!');
      return;
    }
    if (imageFiles.length === 0) {
      toast.error('Please upload at least one product image');
      return;
    }
    setIsCreatingProduct(true);

    try {
      // 1. Upload all images to Cloudinary via /api/upload/image in parallel
      const uploadPromises = imageFiles.map(async (file) => {
        const formData = new FormData();
        formData.append('image', file);
        const res = await api.post('/upload/image', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        if (!res.data.success) {
          throw new Error(`Failed to upload ${file.name}`);
        }
        return { url: res.data.url, publicId: res.data.publicId };
      });

      const uploadedImages = await Promise.all(uploadPromises);

      // 2. Create the product
      const productData = {
        name,
        price: Number(price),
        discountPrice: discountPrice ? Number(discountPrice) : 0,
        description,
        category,
        sizes: sizes.split(',').map((s) => s.trim()),
        colors: colors.split(',').map((c) => c.trim()),
        stock: Number(stock),
        images: uploadedImages,
      };

      const productRes = await api.post('/products', productData);

      if (productRes.data.success) {
        toast.success('Product created successfully!');
        setName('');
        setPrice('');
        setDiscountPrice('');
        setDescription('');
        setImageFiles([]);
        fetchData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to create product');
    } finally {
      setIsCreatingProduct(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      const response = await api.delete(`/products/${id}`);
      if (response.data.success) {
        toast.success('Product deleted');
        fetchData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete product');
    }
  };

  const handleUpdateStatus = async (orderId, statusVal, courierServiceVal, trackingIdVal) => {
    try {
      const response = await api.put(`/orders/${orderId}/status`, {
        status: statusVal,
        courierService: courierServiceVal,
        trackingId: trackingIdVal,
        note: `Order status updated to ${statusVal}`,
      });
      if (response.data.success) {
        toast.success('Order status updated successfully!');
        fetchData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update order status');
    }
  };

  const handleLogoUpload = async (e) => {
    e.preventDefault();
    if (!logoFile) {
      toast.error('Please select a logo image first');
      return;
    }
    setIsUploadingLogo(true);
    try {
      const formData = new FormData();
      formData.append('image', logoFile);

      const uploadRes = await api.post('/upload/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (!uploadRes.data.success) {
        throw new Error('Failed to upload logo to Cloudinary');
      }

      const imageUrl = uploadRes.data.url;

      await dispatch(updateSetting({ key: 'logoUrl', value: imageUrl })).unwrap();
      toast.success('Site logo updated successfully!');
      setLogoFile(null);
    } catch (err) {
      toast.error(err.message || 'Failed to update site logo');
    } finally {
      setIsUploadingLogo(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col gap-12">
      <div>
        <h1 className="text-3xl font-extrabold text-white">Admin Dashboard</h1>
        <p className="text-sm text-zinc-400 mt-1">Manage categories, products, and check store statistics.</p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 flex flex-col gap-1">
            <span className="text-xs uppercase font-bold text-zinc-500">Total Revenue</span>
            <span className="text-2xl font-bold text-emerald-400">₹{stats.totalRevenue}</span>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 flex flex-col gap-1">
            <span className="text-xs uppercase font-bold text-zinc-500">Total Orders</span>
            <span className="text-2xl font-bold text-white">{stats.totalOrders}</span>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 flex flex-col gap-1">
            <span className="text-xs uppercase font-bold text-zinc-500">Pending Orders</span>
            <span className="text-2xl font-bold text-amber-500">{stats.pendingOrders}</span>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 flex flex-col gap-1">
            <span className="text-xs uppercase font-bold text-zinc-500">Delivered Orders</span>
            <span className="text-2xl font-bold text-purple-400">{stats.deliveredOrders}</span>
          </div>
        </div>
      )}

      {/* Grid: Forms */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left Column: Create Product Form */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8 flex flex-col gap-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FaPlusCircle className="text-amber-500" /> Create Product
          </h2>

          <form onSubmit={handleCreateProduct} className="flex flex-col gap-4">
            <div>
              <label className="text-xs text-zinc-400 block mb-1">Product Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Product Name"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-sm text-zinc-200 focus:outline-none focus:border-zinc-700"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-zinc-400 block mb-1">Price (₹)</label>
                <input
                  type="number"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="Price"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-sm text-zinc-200 focus:outline-none focus:border-zinc-700"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-400 block mb-1">Discount Price (₹)</label>
                <input
                  type="number"
                  value={discountPrice}
                  onChange={(e) => setDiscountPrice(e.target.value)}
                  placeholder="Discount Price (Optional)"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-sm text-zinc-200 focus:outline-none focus:border-zinc-700"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-zinc-400 block mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-sm text-zinc-200 focus:outline-none focus:border-zinc-700 cursor-pointer"
                >
                  {categories.length === 0 ? (
                    <option value="">No categories available — Create one first</option>
                  ) : (
                    categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))
                  )}
                </select>
              </div>
              <div>
                <label className="text-xs text-zinc-400 block mb-1">Stock Qty</label>
                <input
                  type="number"
                  required
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-sm text-zinc-200 focus:outline-none focus:border-zinc-700"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-zinc-400 block mb-1">Sizes (comma-separated)</label>
                <input
                  type="text"
                  required
                  value={sizes}
                  onChange={(e) => setSizes(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-sm text-zinc-200 focus:outline-none focus:border-zinc-700"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-400 block mb-1">Colors (comma-separated)</label>
                <input
                  type="text"
                  required
                  value={colors}
                  onChange={(e) => setColors(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-sm text-zinc-200 focus:outline-none focus:border-zinc-700"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-zinc-400 block mb-1">Product Description</label>
              <textarea
                required
                rows="3"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="High quality cotton fabric..."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-sm text-zinc-200 focus:outline-none focus:border-zinc-700 resize-none"
              ></textarea>
            </div>

            <div>
              <label className="text-xs text-zinc-400 block mb-1">Upload Product Images (Select multiple for color variants)</label>
              <input
                type="file"
                required
                multiple
                accept="image/*"
                onChange={(e) => setImageFiles(Array.from(e.target.files))}
                className="w-full text-zinc-300 text-sm border border-zinc-800 bg-zinc-950 rounded-lg px-4 py-2 cursor-pointer focus:outline-none"
              />
              {imageFiles.length > 0 && (
                <span className="text-xs text-zinc-500 mt-1 block">
                  {imageFiles.length} file(s) selected
                </span>
              )}
            </div>

            <button
              type="submit"
              disabled={isCreatingProduct}
              className="w-full bg-gradient-to-r from-amber-500 to-purple-600 hover:from-amber-600 hover:to-purple-700 disabled:opacity-50 text-white font-bold py-2.5 rounded-lg shadow-lg cursor-pointer transition-all mt-2"
            >
              {isCreatingProduct ? 'Creating Product...' : 'Create Product'}
            </button>
          </form>
        </div>

        {/* Right Column: Manage Categories & Products list */}
        <div className="flex flex-col gap-12">
          {/* Create Category Form */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 flex flex-col gap-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <FaPlusCircle className="text-purple-400" /> Create Category
            </h2>
            <form onSubmit={handleCreateCategory} className="flex gap-4">
              <input
                type="text"
                required
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Category Name"
                className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-sm text-zinc-200 focus:outline-none focus:border-zinc-700"
              />
              <button
                type="submit"
                className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors cursor-pointer"
              >
                Add Category
              </button>
            </form>
          </div>

          {/* Site Settings / Logo Upload */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 flex flex-col gap-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <FaPlusCircle className="text-amber-500" /> Site Settings (Logo)
            </h2>
            <form onSubmit={handleLogoUpload} className="flex flex-col gap-4">
              <div>
                <label className="text-xs text-zinc-400 block mb-1">Current Logo</label>
                {logoUrl ? (
                  <div className="bg-zinc-950 p-4 rounded border border-zinc-800 flex justify-center items-center">
                    <img src={logoUrl} alt="Site Logo" className="h-12 w-auto object-contain rounded" />
                  </div>
                ) : (
                  <p className="text-sm text-zinc-500 italic">No logo uploaded yet</p>
                )}
              </div>
              <div>
                <label className="text-xs text-zinc-400 block mb-1">Upload New Logo PNG</label>
                <input
                  type="file"
                  required
                  accept="image/png, image/jpeg"
                  onChange={(e) => setLogoFile(e.target.files[0])}
                  className="w-full text-zinc-300 text-sm border border-zinc-800 bg-zinc-950 rounded-lg px-4 py-2 cursor-pointer focus:outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={isUploadingLogo}
                className="w-full bg-gradient-to-r from-amber-500 to-purple-600 hover:from-amber-600 hover:to-purple-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg text-sm shadow-lg transition-colors cursor-pointer"
              >
                {isUploadingLogo ? 'Uploading Logo...' : 'Update Logo'}
              </button>
            </form>
          </div>

          {/* Manage Products list */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 flex flex-col gap-4 max-h-96 overflow-y-auto">
            <h2 className="text-lg font-bold text-white">Active Products ({products?.length || 0})</h2>
            <div className="flex flex-col gap-3">
              {products?.length === 0 ? (
                <p className="text-zinc-500 text-sm">No active products.</p>
              ) : (
                products?.map((prod) => (
                  <div key={prod._id} className="flex items-center justify-between border-b border-zinc-800/50 pb-3 last:border-0 last:pb-0">
                    <div className="min-w-0 flex items-center gap-3">
                      <img src={prod.images?.[0]?.url || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&auto=format&fit=crop&q=60'} alt="" className="w-10 h-12 object-cover rounded bg-zinc-950 border border-zinc-800" />
                      <div className="min-w-0">
                        <p className="font-semibold text-white text-sm truncate">{prod.name}</p>
                        <p className="text-xs text-zinc-500">₹{prod.discountPrice > 0 ? prod.discountPrice : prod.price} | Stock: {prod.stock}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteProduct(prod._id)}
                      className="text-zinc-500 hover:text-red-500 transition-colors p-2 cursor-pointer"
                      title="Delete Product"
                    >
                      <FaTrash />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Full Width Manage Orders Section */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8 flex flex-col gap-6 shadow-xl">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          📦 Manage Customer Orders
        </h2>
        
        {orders?.length === 0 ? (
          <p className="text-zinc-500 text-sm italic">No customer orders placed yet.</p>
        ) : (
          <div className="flex flex-col gap-6">
            {orders.map((order) => (
              <AdminOrderCard 
                key={order._id} 
                order={order} 
                onUpdate={handleUpdateStatus} 
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
