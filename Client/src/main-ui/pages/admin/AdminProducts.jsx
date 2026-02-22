import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MainHeader from '../../components/Header/MainHeader';
import ToastMessage from '../../components/common/ToastMessage';
import { useTimedToast } from '../../hooks/useTimedToast';
import { getProducts } from '../../services/productsApi';
import {
  Paper,
  CircularProgress,
  Box,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
} from '@mui/icons-material';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const resolveImageUrl = (value) => {
  if (!value) return '';
  if (value.includes('/images/')) {
    const rewritten = value.replace('/images/', '/uploads/');
    return rewritten.startsWith('http') ? rewritten : `${API_BASE}${rewritten}`;
  }
  if (value.startsWith('http://') || value.startsWith('https://')) return value;
  if (value.startsWith('/')) return `${API_BASE}${value}`;
  return `${API_BASE}/${value}`;
};

const AdminProducts = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingProduct, setEditingProduct] = useState(null);
  const [editFormData, setEditFormData] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [editImageFile, setEditImageFile] = useState(null);
  const [editImagePreview, setEditImagePreview] = useState(null);
  const [editUploading, setEditUploading] = useState(false);
  const [editSuccessOpen, setEditSuccessOpen] = useState(false);
  const [addSuccessOpen, setAddSuccessOpen] = useState(false);
  const [deleteSuccessOpen, setDeleteSuccessOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [editCurrentWeight, setEditCurrentWeight] = useState({
    label: '',
    value: '',
    price: '',
    originalPrice: ''
  });
  const [formData, setFormData] = useState({
    name: '',
    category: 'kitchen',
    image: '',
    description: '',
    inStock: true,
    weights: []
  });
  const [currentWeight, setCurrentWeight] = useState({
    label: '',
    value: '',
    price: '',
    originalPrice: ''
  });
  const { toast, showToast } = useTimedToast(3000);

  const refreshProducts = async () => {
    setLoading(true);
    try {
      const data = await getProducts();
      setProducts(Array.isArray(data) ? data : []);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const adminRole = localStorage.getItem('adminRole');
    if (adminRole !== 'admin') {
      showToast('Access denied. Admin only.', 'error');
      setTimeout(() => navigate('/admin/login'), 1500);
      return;
    }

    let cancelled = false;

    const loadProducts = async () => {
      setLoading(true);
      try {
        const data = await getProducts();
        if (!cancelled) {
          setProducts(Array.isArray(data) ? data : []);
        }
      } catch {
        if (!cancelled) {
          setProducts([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadProducts();

    return () => {
      cancelled = true;
    };
  }, [navigate, showToast]);

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.weights || formData.weights.length === 0) {
      showToast('Please add at least one weight option', 'error');
      return;
    }

    if (!imageFile) {
      showToast('Please select a product image', 'error');
      return;
    }

    try {
      setUploading(true);
      let imageUrl = formData.image;

      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      const response = await fetch(`${API_BASE}/api/admin/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          category: formData.category,
          image: imageUrl,
          description: formData.description,
          inStock: formData.inStock,
          weights: formData.weights
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to add product');
      }

      const result = await response.json();
      await refreshProducts();
      setSelectedCategory('all');
      setSearchTerm('');
      showToast('Product added successfully', 'success');
      resetForm();
      setAddSuccessOpen(true);
    } catch (error) {
      showToast(error.message || 'Failed to add product', 'error');
    }
  };

  const handleAddWeight = () => {
    if (!currentWeight.label || !currentWeight.value || !currentWeight.price) {
      showToast('Please fill all weight fields', 'error');
      return;
    }

    const newWeight = {
      label: currentWeight.label,
      value: currentWeight.value,
      price: parseFloat(currentWeight.price),
      originalPrice: parseFloat(currentWeight.originalPrice) || parseFloat(currentWeight.price),
      discountPercent: 0
    };

    // Calculate discount percent
    if (newWeight.originalPrice > newWeight.price) {
      newWeight.discountPercent = Math.round(
        ((newWeight.originalPrice - newWeight.price) / newWeight.originalPrice) * 100
      );
    }

    setFormData((prev) => ({
      ...prev,
      weights: [...prev.weights, newWeight]
    }));

    setCurrentWeight({
      label: '',
      value: '',
      price: '',
      originalPrice: ''
    });
    showToast('Weight option added', 'success');
  };

  const handleRemoveWeight = (index) => {
    setFormData((prev) => ({
      ...prev,
      weights: prev.weights.filter((_, i) => i !== index)
    }));
  };

  const resetForm = () => {
    setShowForm(false);
    setFormData({
      name: '',
      category: 'kitchen',
      image: '',
      description: '',
      inStock: true,
      weights: []
    });
    setCurrentWeight({
      label: '',
      value: '',
      price: '',
      originalPrice: ''
    });
    setImageFile(null);
    setImagePreview(null);
  };

  const handleDeleteProduct = (id) => {
    setProductToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const handleToggleStock = async (product) => {
    try {
      const nextInStock = product.inStock === false;
      const response = await fetch(`${API_BASE}/api/admin/products/${product._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ inStock: nextInStock })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update stock');
      }

      const result = await response.json();
      setProducts(products.map((p) => (p._id === product._id ? result.data : p)));
      showToast(nextInStock ? 'Marked as In Stock' : 'Marked as Out of Stock', 'success');
    } catch (error) {
      showToast(error.message || 'Failed to update stock', 'error');
    }
  };

  const confirmDeleteProduct = async () => {
    if (!productToDelete) return;

    try {
      const response = await fetch(`${API_BASE}/api/admin/products/${productToDelete}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete product');
      }

      setProducts(products.filter((p) => p._id !== productToDelete));
      showToast('Product deleted successfully', 'success');
      setDeleteConfirmOpen(false);
      setProductToDelete(null);
      setDeleteSuccessOpen(true);
    } catch (error) {
      showToast(error.message || 'Failed to delete product', 'error');
      setDeleteConfirmOpen(false);
      setProductToDelete(null);
    }
  };

  const handleOpenEdit = (product) => {
    setEditingProduct(product);
    setEditFormData({
      name: product.name,
      category: product.category,
      image: product.image,
      description: product.description,
      inStock: product.inStock,
      weights: product.weights || []
    });
  };

  const handleCloseEdit = () => {
    setEditingProduct(null);
    setEditFormData(null);
    setEditCurrentWeight({
      label: '',
      value: '',
      price: '',
      originalPrice: ''
    });
    setEditImageFile(null);
    setEditImagePreview(null);
  };

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleEditWeightChange = (e) => {
    const { name, value } = e.target;
    setEditCurrentWeight((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddEditWeight = () => {
    if (!editCurrentWeight.label || !editCurrentWeight.value || !editCurrentWeight.price) {
      showToast('Please fill all weight fields', 'error');
      return;
    }

    const newWeight = {
      label: editCurrentWeight.label,
      value: editCurrentWeight.value,
      price: parseFloat(editCurrentWeight.price),
      originalPrice: parseFloat(editCurrentWeight.originalPrice) || parseFloat(editCurrentWeight.price),
      discountPercent: 0
    };

    if (newWeight.originalPrice > newWeight.price) {
      newWeight.discountPercent = Math.round(
        ((newWeight.originalPrice - newWeight.price) / newWeight.originalPrice) * 100
      );
    }

    setEditFormData((prev) => ({
      ...prev,
      weights: [...prev.weights, newWeight]
    }));

    setEditCurrentWeight({
      label: '',
      value: '',
      price: '',
      originalPrice: ''
    });
    showToast('Weight option added', 'success');
  };

  const handleRemoveEditWeight = (index) => {
    setEditFormData((prev) => ({
      ...prev,
      weights: prev.weights.filter((_, i) => i !== index)
    }));
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editFormData.name || !editFormData.weights || editFormData.weights.length === 0) {
      showToast('Please add at least one weight option', 'error');
      return;
    }

    try {
      let imageUrl = editFormData.image;

      if (editImageFile) {
        imageUrl = await uploadEditImage(editImageFile);
      }

      const response = await fetch(`${API_BASE}/api/admin/products/${editingProduct._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...editFormData,
          image: imageUrl
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update product');
      }

      const result = await response.json();
      setProducts(products.map((p) => (p._id === editingProduct._id ? result.data : p)));
      showToast('Product updated successfully', 'success');
      handleCloseEdit();
      setEditSuccessOpen(true);
    } catch (error) {
      showToast(error.message || 'Failed to update product', 'error');
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleWeightChange = (e) => {
    const { name, value } = e.target;
    setCurrentWeight((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        showToast('Please select a valid image file', 'error');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        showToast('Image size must be less than 5MB', 'error');
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (file) => {
    try {
      setUploading(true);
      const formDataObj = new FormData();
      formDataObj.append('image', file);

      const response = await fetch(`${API_BASE}/api/upload`, {
        method: 'POST',
        body: formDataObj
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to upload image');
      }

      const result = await response.json();
      return result.data.url;
    } catch (error) {
      showToast(error.message || 'Failed to upload image', 'error');
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const handleEditImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        showToast('Please select a valid image file', 'error');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        showToast('Image size must be less than 5MB', 'error');
        return;
      }
      setEditImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setEditImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const uploadEditImage = async (file) => {
    try {
      setEditUploading(true);
      const formDataObj = new FormData();
      formDataObj.append('image', file);

      const response = await fetch(`${API_BASE}/api/upload`, {
        method: 'POST',
        body: formDataObj
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to upload image');
      }

      const result = await response.json();
      return result.data.url;
    } catch (error) {
      showToast(error.message || 'Failed to upload image', 'error');
      throw error;
    } finally {
      setEditUploading(false);
    }
  };

  const filteredProducts = products.filter(
    (product) => (selectedCategory === 'all' || product.category === selectedCategory)
      && product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-stone-50">
      
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <ToastMessage {...toast} />

        <div className="flex items-center justify-between gap-4">
          <div>
            <Link to="/admin" className="text-sm text-stone-500 hover:text-stone-900">
              ← Dashboard
            </Link>
            <h1 className="mt-2 font-display text-3xl font-bold text-stone-900">Products</h1>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-700"
          >
            {showForm ? '✕ Close' : '+ Add Product'}
          </button>
        </div>

        {/* Add Product Form */}
        {showForm && (
          <div className="mt-8 rounded-2xl border-2 border-primary-200 bg-gradient-to-br from-white via-primary-50 to-white p-8 shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-600">
                <span className="text-lg text-white">📦</span>
              </div>
              <div>
                <h2 className="font-display text-2xl font-bold text-stone-900">Add New Product</h2>
                <p className="text-xs text-stone-500 mt-1">Fill in product details and add weight variants</p>
              </div>
            </div>

            <form onSubmit={handleAddProduct} className="space-y-6">
              {/* Basic Information Section */}
              <div className="rounded-xl border border-stone-200 bg-white p-6">
                <h3 className="flex items-center gap-2 text-sm font-bold text-stone-900 mb-4">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-100 text-xs font-bold text-primary-600">1</span>
                  Basic Information
                </h3>
                
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-2">Product Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="eg. Basmati Rice, Face Wash"
                      className="w-full rounded-lg border-2 border-stone-200 px-4 py-3 text-sm transition focus:border-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-200"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-2">Category *</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full rounded-lg border-2 border-stone-200 px-4 py-3 text-sm transition focus:border-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-200"
                    >
                      <option value="kitchen">🍳 Kitchen</option>
                      <option value="snacks">🍿 Snacks</option>
                      <option value="beauty">💄 Beauty</option>
                      <option value="bakery">🥐 Bakery</option>
                      <option value="household">🧹 Household</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-sm font-semibold text-stone-700 mb-2">Product Image *</label>
                    <div className="border-2 border-dashed border-stone-300 rounded-lg p-6 text-center hover:border-primary-600 transition">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageSelect}
                        className="hidden"
                        id="imageInput"
                        disabled={uploading}
                      />
                      {imagePreview ? (
                        <div className="space-y-4">
                          <img src={imagePreview} alt="Preview" className="w-32 h-32 object-cover rounded-lg mx-auto" />
                          <div>
                            <p className="text-sm font-semibold text-stone-900">{imageFile?.name}</p>
                            <p className="text-xs text-stone-500">{(imageFile?.size / 1024).toFixed(2)} KB</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => { setImageFile(null); setImagePreview(null); document.getElementById('imageInput').value = ''; }}
                            className="text-sm text-red-600 hover:text-red-700 font-semibold"
                          >
                            Change Image
                          </button>
                        </div>
                      ) : (
                        <label htmlFor="imageInput" className="cursor-pointer">
                          <p className="text-3xl mb-2">📸</p>
                          <p className="text-sm font-semibold text-stone-900">Click to upload or drag and drop</p>
                          <p className="text-xs text-stone-500 mt-1">PNG, JPG, GIF or WebP (max 5MB)</p>
                        </label>
                      )}
                    </div>
                    {uploading && <p className="text-xs text-blue-600 mt-2">⏳ Uploading image...</p>}
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-sm font-semibold text-stone-700 mb-2">Description</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows={3}
                      placeholder="Product description (optional)..."
                      className="w-full rounded-lg border-2 border-stone-200 px-4 py-3 text-sm transition focus:border-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-200"
                    />
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50 border border-green-200">
                    <input
                      type="checkbox"
                      name="inStock"
                      checked={formData.inStock}
                      onChange={handleChange}
                      className="h-5 w-5 accent-primary-600 cursor-pointer"
                    />
                    <label className="text-sm font-semibold text-stone-700 cursor-pointer flex-1">
                      ✓ In Stock
                    </label>
                  </div>
                </div>
              </div>

              {/* Weight Options Section */}
              <div className="rounded-xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white p-6">
                <h3 className="flex items-center gap-2 text-sm font-bold text-stone-900 mb-4">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600">2</span>
                  Weight Options
                </h3>
                <p className="text-xs text-stone-600 mb-4">Add at least one weight variant with pricing</p>
                
                {/* Weight Input Fields */}
                <div className="space-y-3 mb-4">
                  <div className="grid gap-3 sm:grid-cols-4">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1.5 uppercase tracking-wide">Weight Label *</label>
                      <input
                        type="text"
                        name="label"
                        value={currentWeight.label}
                        onChange={handleWeightChange}
                        placeholder="500g"
                        className="w-full rounded-lg border-2 border-blue-200 px-3 py-2.5 text-sm transition focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-200"
                      />
                      <p className="text-xs text-stone-500 mt-1">e.g., 500g, 1kg</p>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1.5 uppercase tracking-wide">Value *</label>
                      <input
                        type="text"
                        name="value"
                        value={currentWeight.value}
                        onChange={handleWeightChange}
                        placeholder="500g"
                        className="w-full rounded-lg border-2 border-blue-200 px-3 py-2.5 text-sm transition focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-200"
                      />
                      <p className="text-xs text-stone-500 mt-1">Internal value</p>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1.5 uppercase tracking-wide">Price *</label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-stone-600 font-semibold">₹</span>
                        <input
                          type="number"
                          name="price"
                          value={currentWeight.price}
                          onChange={handleWeightChange}
                          placeholder="150"
                          className="w-full rounded-lg border-2 border-blue-200 pl-6 pr-3 py-2.5 text-sm transition focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-200"
                        />
                      </div>
                      <p className="text-xs text-stone-500 mt-1">Selling price</p>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1.5 uppercase tracking-wide">Original Price</label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-stone-600 font-semibold">₹</span>
                        <input
                          type="number"
                          name="originalPrice"
                          value={currentWeight.originalPrice}
                          onChange={handleWeightChange}
                          placeholder="200"
                          className="w-full rounded-lg border-2 border-blue-200 pl-6 pr-3 py-2.5 text-sm transition focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-200"
                        />
                      </div>
                      <p className="text-xs text-stone-500 mt-1">For discount %</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddWeight}
                    className="w-full rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3 text-sm font-semibold text-white transition hover:from-blue-700 hover:to-blue-800 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                  >
                    <span>+</span> Add Weight Option
                  </button>
                </div>

                {/* Added Weights List */}
                {formData.weights.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="text-xs font-bold text-stone-700 uppercase tracking-wide mb-3">Added Weights ({formData.weights.length})</p>
                    {formData.weights.map((weight, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between rounded-lg bg-white p-4 border-2 border-green-200 shadow-sm hover:shadow-md transition"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-xs font-bold text-green-700">✓</span>
                            <p className="text-sm font-bold text-stone-900">
                              {weight.label}
                            </p>
                          </div>
                          <div className="flex items-center gap-3 mt-2">
                            <span className="text-lg font-bold text-green-600">₹{weight.price}</span>
                            {weight.originalPrice !== weight.price && (
                              <>
                                <span className="text-xs line-through text-stone-400">₹{weight.originalPrice}</span>
                                <span className="bg-red-100 text-red-700 text-xs font-bold px-2.5 py-1 rounded-full">
                                  {weight.discountPercent}% OFF
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveWeight(idx)}
                          className="ml-4 text-red-600 hover:text-red-700 hover:bg-red-50 font-bold text-sm px-3 py-2 rounded-lg transition"
                        >
                          ✕ Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Form Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={formData.weights.length === 0}
                  className="flex-1 rounded-lg bg-gradient-to-r from-green-600 to-green-700 px-6 py-3 text-sm font-bold text-white transition hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                >
                  <span>✓</span> Add Product
                </button>
                <button
                  type="button"
                  onClick={() => resetForm()}
                  className="px-6 py-3 rounded-lg border-2 border-stone-300 text-sm font-semibold text-stone-700 transition hover:bg-stone-100"
                >
                  Clear Form
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Products Table with Category Filter */}
        <Box sx={{ mt: 4, mb: 4 }}>
          {/* Search Bar */}
          <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
            <Box sx={{ flex: 1, maxWidth: 400 }}>
              <input
                type="text"
                placeholder="🔍 Search products by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  transition: 'border-color 0.2s',
                  outline: 'none'
                }}
                onFocus={(e) => e.target.style.borderColor = '#2563eb'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              />
            </Box>
            {searchTerm && (
              <Button
                onClick={() => setSearchTerm('')}
                variant="outlined"
                size="small"
                sx={{ textTransform: 'none' }}
              >
                Clear
              </Button>
            )}
          </Box>

          {/* Category Filter */}
          <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'flex-end' }}>
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Filter by Category</InputLabel>
              <Select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                label="Filter by Category"
              >
                <MenuItem value="all">All Categories</MenuItem>
                <MenuItem value="kitchen">🍳 Kitchen</MenuItem>
                <MenuItem value="snacks">🍿 Snacks</MenuItem>
                <MenuItem value="beverages">☕ Beverages</MenuItem>
                <MenuItem value="dairy">🥛 Dairy</MenuItem>
                <MenuItem value="bakery">🍞 Bakery</MenuItem>
                <MenuItem value="spices">🌶️ Spices</MenuItem>
              </Select>
            </FormControl>
            <Box sx={{ color: '#666' }}>
              {selectedCategory === 'all'
                ? `Total: ${filteredProducts.length} products`
                : `Showing: ${filteredProducts.length} products`
              }
            </Box>
          </Box>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
              <CircularProgress />
            </Box>
          ) : products.length === 0 ? (
            <Paper sx={{ p: 6, textAlign: 'center' }}>
              <Box sx={{ fontSize: '3rem', mb: 2 }}>📦</Box>
              <Box sx={{ fontSize: '1.2rem', fontWeight: 600, color: '#333' }}>No products found</Box>
              <Box sx={{ fontSize: '0.85rem', color: '#666', mt: 1 }}>Click "Add Product" to get started</Box>
            </Paper>
          ) : (
            <Box sx={{ height: 560, width: '100%', boxShadow: 2, borderRadius: '8px', overflow: 'hidden' }}>
              <DataGrid
                rows={filteredProducts}
                getRowId={(row) => row._id}
                columns={[
                  {
                    field: 'name',
                    headerName: 'Product',
                    flex: 1.2,
                    minWidth: 200,
                    renderCell: (params) => (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, height: '100%' }}>
                        <Box
                          component="img"
                          src={resolveImageUrl(params.row.image) || 'https://placehold.co/50x50/f5f5f4/78716c?text=No+Image'}
                          alt={params.row.name}
                          sx={{ width: 56, height: 56, borderRadius: 1, objectFit: 'cover', flexShrink: 0 }}
                          onError={(e) => { e.target.src = 'https://placehold.co/50x50/f5f5f4/78716c?text=No+Image'; }}
                        />
                        <Box>
                          <Box sx={{ fontWeight: 600, color: '#1f2937', fontSize: '0.9rem' }}>{params.row.name}</Box>
                          <Box sx={{ fontSize: '0.7rem', color: '#999' }}>ID: {params.row._id}</Box>
                        </Box>
                      </Box>
                    )
                  },
                  {
                    field: 'category',
                    headerName: 'Category',
                    flex: 0.8,
                    minWidth: 120,
                    renderCell: (params) => (
                      <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, backgroundColor: '#dbeafe', color: '#1e40af', px: 1.5, py: 0.5, borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600, textTransform: 'capitalize' }}>
                        {params.row.category}
                      </Box>
                    )
                  },
                  {
                    field: 'weights',
                    headerName: 'Weight Options',
                    flex: 1.2,
                    minWidth: 200,
                    sortable: false,
                    renderCell: (params) => (
                      <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', py: 1 }}>
                        {params.row.weights && params.row.weights.length > 0 ? (
                          params.row.weights.map((w, idx) => (
                            <Box key={idx} sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, backgroundColor: '#dcfce7', color: '#166534', px: 1.25, py: 0.5, borderRadius: 1, fontSize: '0.7rem', fontWeight: 600 }}>
                              <span>✓</span> {w.label}: ₹{w.price}
                            </Box>
                          ))
                        ) : (
                          <Box sx={{ fontSize: '0.75rem', color: '#999', fontStyle: 'italic' }}>No weights</Box>
                        )}
                      </Box>
                    )
                  },
                  {
                    field: 'inStock',
                    headerName: 'Stock Status',
                    flex: 0.9,
                    minWidth: 120,
                    renderCell: (params) => (
                      <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, px: 1.5, py: 0.75, borderRadius: '9999px', fontWeight: 600, fontSize: '0.75rem', backgroundColor: params.row.inStock === false ? '#fee2e2' : '#dcfce7', color: params.row.inStock === false ? '#991b1b' : '#166534' }}>
                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'currentColor' }} />
                        {params.row.inStock === false ? 'Out of Stock' : 'In Stock'}
                      </Box>
                    )
                  },
                  {
                    field: 'actions',
                    headerName: 'Actions',
                    flex: 1.2,
                    minWidth: 260,
                    sortable: false,
                    renderCell: (params) => (
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', height: '100%' }}>
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => handleToggleStock(params.row)}
                          color={params.row.inStock === false ? 'success' : 'warning'}
                          sx={{ textTransform: 'none', fontSize: '0.75rem' }}
                        >
                          {params.row.inStock === false ? 'In Stock' : 'Out Stock'}
                        </Button>
                        <Button
                          variant="outlined"
                          color="primary"
                          size="small"
                          startIcon={<EditIcon />}
                          onClick={() => handleOpenEdit(params.row)}
                          sx={{ textTransform: 'none', fontSize: '0.75rem' }}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="contained"
                          color="error"
                          size="small"
                          startIcon={<DeleteIcon />}
                          onClick={() => handleDeleteProduct(params.row._id)}
                          sx={{ textTransform: 'none', fontSize: '0.75rem' }}
                        >
                          Delete
                        </Button>
                      </Box>
                    )
                  }
                ]}
                initialState={{
                  pagination: { paginationModel: { pageSize: 10, page: 0 } }
                }}
                pageSizeOptions={[10, 25, 50]}
                disableRowSelectionOnClick
                getRowHeight={() => 'auto'}
                rowHeight={72}
                columnHeaderHeight={52}
                sx={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  '& .MuiDataGrid-columnHeaders': {
                    backgroundColor: '#f8fafc',
                    borderBottom: '1px solid #e5e7eb'
                  },
                  '& .MuiDataGrid-columnHeaderTitle': {
                    fontWeight: 600,
                    color: '#111827'
                  },
                  '& .MuiDataGrid-cell': {
                    borderBottom: '1px solid #f1f5f9',
                    alignItems: 'center',
                    py: 1
                  },
                  '& .MuiDataGrid-row:hover': {
                    backgroundColor: '#f8fafc'
                  },
                  '& .MuiDataGrid-virtualScroller': {
                    overflowX: 'hidden'
                  }
                }}
              />
            </Box>
          )}
        </Box>

        {/* Edit Product Dialog */}
        <Dialog open={!!editingProduct} onClose={handleCloseEdit} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ fontWeight: 700, fontSize: '1.2rem', pb: 1 }}>Edit Product</DialogTitle>
          <DialogContent dividers sx={{ pt: 2 }}>
            {editFormData && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {/* Basic Information */}
                <Box>
                  <Box sx={{ fontWeight: 600, fontSize: '0.9rem', mb: 2, color: '#333' }}>Basic Information</Box>
                  
                  <Box sx={{ mb: 2 }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px', color: '#1f2937' }}>Product Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={editFormData.name}
                      onChange={handleEditChange}
                      style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px', fontFamily: 'inherit', boxSizing: 'border-box' }}
                    />
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px', color: '#1f2937' }}>Category *</label>
                    <select
                      name="category"
                      value={editFormData.category}
                      onChange={handleEditChange}
                      style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px', fontFamily: 'inherit', boxSizing: 'border-box' }}
                    >
                      <option value="kitchen">🍳 Kitchen</option>
                      <option value="snacks">🍿 Snacks</option>
                      <option value="beverages">☕ Beverages</option>
                      <option value="dairy">🥛 Dairy</option>
                      <option value="bakery">🍞 Bakery</option>
                      <option value="spices">🌶️ Spices</option>
                    </select>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px', color: '#1f2937' }}>Product Image</label>
                    <Box sx={{ border: '2px dashed #ddd', borderRadius: '6px', p: 2, textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s', '&:hover': { borderColor: '#2563eb', backgroundColor: '#f0f7ff' } }}>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleEditImageSelect}
                        className="hidden"
                        id="editImageInput"
                        disabled={editUploading}
                      />
                      {editImagePreview ? (
                        <Box>
                          <img src={editImagePreview} alt="Preview" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '4px', margin: '0 auto 8px' }} />
                          <Box sx={{ fontSize: '0.75rem', color: '#666' }}>
                            {editImageFile?.name} ({(editImageFile?.size / 1024).toFixed(2)} KB)
                          </Box>
                          <Button
                            type="button"
                            onClick={() => { setEditImageFile(null); setEditImagePreview(null); document.getElementById('editImageInput').value = ''; }}
                            size="small"
                            sx={{ mt: 1, textTransform: 'none' }}
                          >
                            Change
                          </Button>
                        </Box>
                      ) : (
                        <label htmlFor="editImageInput" style={{ cursor: 'pointer', display: 'block' }}>
                          <Box sx={{ fontSize: '1.5rem', mb: 1 }}>📸</Box>
                          <Box sx={{ fontSize: '0.85rem', fontWeight: 600, color: '#333' }}>Click to upload new image</Box>
                          <Box sx={{ fontSize: '0.75rem', color: '#666', mt: 0.5 }}>or drag and drop</Box>
                        </label>
                      )}
                      {editUploading && <Box sx={{ mt: 1, fontSize: '0.75rem', color: '#2563eb' }}>⏳ Uploading...</Box>}
                    </Box>
                    <Box sx={{ fontSize: '0.75rem', color: '#666', mt: 1 }}>Current: <img src={resolveImageUrl(editFormData.image)} alt="Current" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '3px', verticalAlign: 'middle', marginLeft: '4px' }} /></Box>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px', color: '#1f2937' }}>Description</label>
                    <textarea
                      name="description"
                      value={editFormData.description}
                      onChange={handleEditChange}
                      rows="3"
                      style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px', fontFamily: 'inherit', boxSizing: 'border-box', resize: 'none' }}
                    />
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <input
                      type="checkbox"
                      name="inStock"
                      checked={editFormData.inStock}
                      onChange={handleEditChange}
                      id="editInStock"
                      style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                    />
                    <label htmlFor="editInStock" style={{ cursor: 'pointer', fontSize: '14px', fontWeight: 500, color: '#333' }}>In Stock</label>
                    <span
                      style={{
                        fontSize: '12px',
                        fontWeight: 700,
                        padding: '4px 10px',
                        borderRadius: '999px',
                        backgroundColor: editFormData.inStock ? '#dcfce7' : '#fee2e2',
                        color: editFormData.inStock ? '#166534' : '#991b1b'
                      }}
                    >
                      {editFormData.inStock ? '✓ In Stock' : '✕ Out of Stock'}
                    </span>
                  </Box>
                </Box>

                {/* Weight Options */}
                <Box sx={{ borderTop: '1px solid #ddd', pt: 2 }}>
                  <Box sx={{ fontWeight: 600, fontSize: '0.9rem', mb: 2, color: '#333' }}>Weight Options *</Box>

                  {editFormData.weights.map((w, idx) => (
                    <Box key={idx} sx={{ mb: 2, p: 2, backgroundColor: '#f0f9ff', borderLeft: '4px solid #2563eb', borderRadius: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Box sx={{ fontWeight: 600, color: '#1f2937' }}>{w.label}</Box>
                        <Box sx={{ fontSize: '0.85rem', color: '#666' }}>₹{w.price} {w.discountPercent > 0 && <span style={{ color: '#dc2626' }}>({w.discountPercent}% OFF)</span>}</Box>
                      </Box>
                      <Button color="error" size="small" onClick={() => handleRemoveEditWeight(idx)}>Remove</Button>
                    </Box>
                  ))}

                  <Box sx={{ mb: 2, p: 2, border: '2px solid #2563eb', borderRadius: '6px', backgroundColor: '#f0f7ff' }}>
                    <Box sx={{ mb: 2 }}>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px', color: '#1f2937' }}>Label (e.g., 500g, 1kg) *</label>
                      <input
                        type="text"
                        name="label"
                        value={editCurrentWeight.label}
                        onChange={handleEditWeightChange}
                        placeholder="500g"
                        style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px', fontFamily: 'inherit', boxSizing: 'border-box' }}
                      />
                    </Box>

                    <Box sx={{ mb: 2 }}>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px', color: '#1f2937' }}>Value *</label>
                      <input
                        type="text"
                        name="value"
                        value={editCurrentWeight.value}
                        onChange={handleEditWeightChange}
                        placeholder="0.5"
                        style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px', fontFamily: 'inherit', boxSizing: 'border-box' }}
                      />
                    </Box>

                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
                      <Box>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px', color: '#1f2937' }}>Price (₹) *</label>
                        <input
                          type="number"
                          name="price"
                          value={editCurrentWeight.price}
                          onChange={handleEditWeightChange}
                          placeholder="150"
                          style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px', fontFamily: 'inherit', boxSizing: 'border-box' }}
                        />
                      </Box>
                      <Box>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px', color: '#1f2937' }}>Original Price (₹)</label>
                        <input
                          type="number"
                          name="originalPrice"
                          value={editCurrentWeight.originalPrice}
                          onChange={handleEditWeightChange}
                          placeholder="200"
                          style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px', fontFamily: 'inherit', boxSizing: 'border-box' }}
                        />
                      </Box>
                    </Box>

                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleAddEditWeight}
                      fullWidth
                      sx={{ textTransform: 'none' }}
                    >
                      Add Weight Option
                    </Button>
                  </Box>
                </Box>
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={handleCloseEdit} sx={{ textTransform: 'none' }}>Cancel</Button>
            <Button onClick={handleSaveEdit} variant="contained" color="primary" sx={{ textTransform: 'none' }}>
              Save Changes
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteConfirmOpen} onClose={() => { setDeleteConfirmOpen(false); setProductToDelete(null); }}>
          <DialogTitle sx={{ fontWeight: 700, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: 1 }}>
            <span style={{ color: '#dc2626' }}>⚠️</span> Confirm Delete
          </DialogTitle>
          <DialogContent sx={{ pt: 2 }}>
            <Box sx={{ color: '#1f2937', fontSize: '0.95rem' }}>
              Are you sure you want to delete this product? This action cannot be undone.
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => { setDeleteConfirmOpen(false); setProductToDelete(null); }} sx={{ textTransform: 'none' }}>
              Cancel
            </Button>
            <Button onClick={confirmDeleteProduct} variant="contained" color="error" sx={{ textTransform: 'none' }}>
              Delete Product
            </Button>
          </DialogActions>
        </Dialog>

        {/* Add Success Dialog */}
        <Dialog open={addSuccessOpen} onClose={() => setAddSuccessOpen(false)}>
          <DialogTitle sx={{ fontWeight: 700, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: 1 }}>
            <span style={{ color: '#16a34a' }}>✅</span> Product Added
          </DialogTitle>
          <DialogContent sx={{ pt: 2 }}>
            <Box sx={{ color: '#1f2937', fontSize: '0.95rem' }}>
              Product added successfully.
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setAddSuccessOpen(false)} variant="contained" color="success" sx={{ textTransform: 'none' }}>
              OK
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Success Dialog */}
        <Dialog open={deleteSuccessOpen} onClose={() => setDeleteSuccessOpen(false)}>
          <DialogTitle sx={{ fontWeight: 700, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: 1 }}>
            <span style={{ color: '#16a34a' }}>✅</span> Product Deleted
          </DialogTitle>
          <DialogContent sx={{ pt: 2 }}>
            <Box sx={{ color: '#1f2937', fontSize: '0.95rem' }}>
              Product deleted successfully.
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setDeleteSuccessOpen(false)} variant="contained" color="success" sx={{ textTransform: 'none' }}>
              OK
            </Button>
          </DialogActions>
        </Dialog>

        {/* Edit Success Dialog */}
        <Dialog open={editSuccessOpen} onClose={() => setEditSuccessOpen(false)}>
          <DialogTitle sx={{ fontWeight: 700, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: 1 }}>
            <span style={{ color: '#16a34a' }}>✅</span> Update Complete
          </DialogTitle>
          <DialogContent sx={{ pt: 2 }}>
            <Box sx={{ color: '#1f2937', fontSize: '0.95rem' }}>
              Product details updated successfully.
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setEditSuccessOpen(false)} variant="contained" color="success" sx={{ textTransform: 'none' }}>
              OK
            </Button>
          </DialogActions>
        </Dialog>
      </main>
    </div>
  );
};

export default AdminProducts;
