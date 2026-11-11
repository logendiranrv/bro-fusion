import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = () => {
  return Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl !== 'https://your-project-id.supabase.co' &&
    !supabaseUrl.includes('your-project-id')
  );
};

export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// ==========================================
// PRODUCTS SERVICE
// ==========================================
export const supabaseGetProducts = async (filters = {}) => {
  if (!supabase) throw new Error('Supabase is not configured yet');

  let query = supabase
    .from('products')
    .select('*, categories(name, slug)');

  if (filters.category) {
    query = query.eq('category_id', filters.category);
  }
  if (filters.search) {
    query = query.ilike('name', `%${filters.search}%`);
  }
  if (filters.sort === 'price_asc') {
    query = query.order('price', { ascending: true });
  } else if (filters.sort === 'price_desc') {
    query = query.order('price', { ascending: false });
  } else {
    query = query.order('created_at', { ascending: false });
  }

  const { data, error } = await query;
  if (error) throw error;

  // Transform keys for frontend compatibility
  return data.map((item) => ({
    _id: item.id,
    name: item.name,
    slug: item.slug,
    description: item.description,
    price: Number(item.price),
    discountPrice: Number(item.discount_price || 0),
    images: item.images || [],
    sizes: item.sizes || [],
    colors: item.colors || [],
    stock: item.stock || 0,
    category: item.categories || null,
    categoryId: item.category_id,
    isFeatured: item.is_featured,
    isNewArrival: item.is_new_arrival,
    isBestSeller: item.is_best_seller,
    createdAt: item.created_at,
  }));
};

export const supabaseGetProductBySlug = async (slug) => {
  if (!supabase) throw new Error('Supabase is not configured yet');

  const { data, error } = await supabase
    .from('products')
    .select('*, categories(name, slug)')
    .eq('slug', slug)
    .single();

  if (error) throw error;
  if (!data) return null;

  return {
    _id: data.id,
    name: data.name,
    slug: data.slug,
    description: data.description,
    price: Number(data.price),
    discountPrice: Number(data.discount_price || 0),
    images: data.images || [],
    sizes: data.sizes || [],
    colors: data.colors || [],
    stock: data.stock || 0,
    category: data.categories || null,
    categoryId: data.category_id,
    isFeatured: data.is_featured,
    isNewArrival: data.is_new_arrival,
    isBestSeller: data.is_best_seller,
    createdAt: data.created_at,
  };
};

export const supabaseCreateProduct = async (productData) => {
  if (!supabase) throw new Error('Supabase is not configured yet');

  const slug =
    productData.slug ||
    productData.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

  const payload = {
    name: productData.name,
    slug,
    description: productData.description,
    category_id: productData.category,
    images: productData.images || [],
    price: Number(productData.price),
    discount_price: Number(productData.discountPrice || 0),
    sizes: productData.sizes || [],
    colors: productData.colors || [],
    stock: Number(productData.stock || 0),
    is_featured: Boolean(productData.isFeatured),
    is_new_arrival: Boolean(productData.isNewArrival),
    is_best_seller: Boolean(productData.isBestSeller),
  };

  const { data, error } = await supabase
    .from('products')
    .insert([payload])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const supabaseDeleteProduct = async (id) => {
  if (!supabase) throw new Error('Supabase is not configured yet');
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) throw error;
  return true;
};

// ==========================================
// CATEGORIES SERVICE
// ==========================================
export const supabaseGetCategories = async () => {
  if (!supabase) throw new Error('Supabase is not configured yet');

  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (error) throw error;

  return data.map((c) => ({
    _id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description,
    imageUrl: c.image_url,
  }));
};

export const supabaseCreateCategory = async (name) => {
  if (!supabase) throw new Error('Supabase is not configured yet');

  const slug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

  const { data, error } = await supabase
    .from('categories')
    .insert([{ name, slug }])
    .select()
    .single();

  if (error) throw error;
  return { _id: data.id, name: data.name, slug: data.slug };
};

// ==========================================
// ORDERS SERVICE (WhatsApp & Direct)
// ==========================================
export const supabaseCreateOrder = async (orderData) => {
  if (!supabase) throw new Error('Supabase is not configured yet');

  const orderNumber = 'BF-' + Math.floor(100000 + Math.random() * 900000);

  const payload = {
    order_number: orderNumber,
    customer_name: orderData.shippingAddress.name,
    customer_phone: orderData.shippingAddress.phone,
    customer_email: orderData.shippingAddress.email || '',
    address: orderData.shippingAddress.address,
    city: orderData.shippingAddress.city,
    state: orderData.shippingAddress.state,
    pincode: orderData.shippingAddress.pincode,
    items: orderData.orderItems || [],
    items_price: Number(orderData.itemsPrice || 0),
    shipping_price: Number(orderData.shippingPrice || 0),
    total_price: Number(orderData.totalPrice || 0),
    payment_method: orderData.paymentMethod || 'WhatsApp Order',
    status: 'pending',
  };

  const { data, error } = await supabase
    .from('orders')
    .insert([payload])
    .select()
    .single();

  if (error) throw error;

  return {
    _id: data.id,
    orderNumber: data.order_number,
    ...data,
  };
};

export const supabaseGetOrders = async () => {
  if (!supabase) throw new Error('Supabase is not configured yet');

  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;

  return data.map((o) => ({
    _id: o.id,
    orderNumber: o.order_number,
    customer: {
      name: o.customer_name,
      phone: o.customer_phone,
      email: o.customer_email,
    },
    shippingAddress: {
      name: o.customer_name,
      phone: o.customer_phone,
      address: o.address,
      city: o.city,
      state: o.state,
      pincode: o.pincode,
    },
    orderItems: o.items || [],
    totalPrice: Number(o.total_price),
    paymentMethod: o.payment_method,
    status: o.status,
    courierService: o.courier_service,
    trackingId: o.tracking_id,
    createdAt: o.created_at,
  }));
};

export const supabaseUpdateOrderStatus = async (orderId, status, courier = '', trackingId = '') => {
  if (!supabase) throw new Error('Supabase is not configured yet');

  const { data, error } = await supabase
    .from('orders')
    .update({
      status,
      courier_service: courier,
      tracking_id: trackingId,
    })
    .eq('id', orderId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// ==========================================
// SETTINGS SERVICE
// ==========================================
export const supabaseGetSettings = async () => {
  if (!supabase) throw new Error('Supabase is not configured yet');

  const { data, error } = await supabase.from('site_settings').select('*');
  if (error) throw error;

  const result = {};
  data.forEach((row) => {
    result[row.key] = row.value;
  });
  return result;
};

export const supabaseUpdateSetting = async (key, value) => {
  if (!supabase) throw new Error('Supabase is not configured yet');

  const { data, error } = await supabase
    .from('site_settings')
    .upsert({ key, value, updated_at: new Date().toISOString() })
    .select()
    .single();

  if (error) throw error;
  return data;
};

// ==========================================
// SUPABASE STORAGE
// ==========================================
export const supabaseUploadImage = async (file, bucket = 'products') => {
  if (!supabase) throw new Error('Supabase is not configured yet');

  const fileExt = file.name.split('.').pop();
  const cleanExt = fileExt ? fileExt.toLowerCase() : 'jpg';
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${cleanExt}`;

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: true,
    });

  if (error) {
    throw error;
  }

  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(fileName);

  return {
    url: publicUrl,
    path: fileName,
  };
};

/**
 * Universal image uploader:
 * Tries Supabase Storage first, falls back safely to Base64 so it never fails.
 */
export const uploadImageFile = async (file, bucket = 'products') => {
  if (isSupabaseConfigured() && supabase) {
    try {
      return await supabaseUploadImage(file, bucket);
    } catch (err) {
      console.warn('Supabase storage bucket upload notice:', err.message);
    }
  }

  // Safe fallback to Data URL
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve({ url: reader.result, path: '' });
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

