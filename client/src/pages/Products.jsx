import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { fetchProducts, fetchCategories } from '../store/slices/productSlice';
import ProductCard from '../components/ProductCard';

export default function Products() {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const { items: products, categories, loading } = useSelector((state) => state.products);

  const sort = searchParams.get('sort') || '';
  const category = searchParams.get('category') || '';
  const search = searchParams.get('search') || '';

  const setSort = (value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) newParams.set('sort', value);
    else newParams.delete('sort');
    setSearchParams(newParams);
  };

  const setCategory = (value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) newParams.set('category', value);
    else newParams.delete('category');
    setSearchParams(newParams);
  };

  const setSearch = (value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) newParams.set('search', value);
    else newParams.delete('search');
    setSearchParams(newParams);
  };

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    const params = {};
    if (sort) params.sort = sort;
    if (category) params.category = category;
    if (search) params.search = search;

    dispatch(fetchProducts(params));
  }, [sort, category, search, dispatch]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10 border-b border-[#202434] pb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-amber-400">Streetwear Lineup</span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mt-1 font-['Syne']">Shop All Drops</h1>
          <p className="text-xs text-zinc-400 mt-1">Explore our complete catalog of heavyweight cotton tees, hoodies & utility cargos.</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search bar */}
          <input
            type="text"
            placeholder="Search items..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-[#10121A] border border-[#202434] focus:border-amber-400 rounded-xl px-4 py-2.5 text-xs text-zinc-200 focus:outline-none"
          />

          {/* Category Filter */}
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="bg-[#10121A] border border-[#202434] focus:border-amber-400 rounded-xl px-4 py-2.5 text-xs text-zinc-200 focus:outline-none cursor-pointer"
          >
            <option value="">All Categories</option>
            {categories?.map((cat) => (
              <option key={cat._id} value={cat._id}>{cat.name}</option>
            ))}
          </select>

          {/* Sort Filter */}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="bg-[#10121A] border border-[#202434] focus:border-amber-400 rounded-xl px-4 py-2.5 text-xs text-zinc-200 focus:outline-none cursor-pointer"
          >
            <option value="">Sort: Default</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="newest">Newest Drops</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <div key={n} className="animate-pulse bg-[#10121A] aspect-[3/4] rounded-2xl border border-[#202434]"></div>
          ))}
        </div>
      ) : products?.length === 0 ? (
        <div className="text-center py-24 text-zinc-500 bg-zinc-900/30 border border-zinc-800 rounded-lg">
          No products match your search or filter.
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
