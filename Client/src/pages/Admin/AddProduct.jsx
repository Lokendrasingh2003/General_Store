import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './AddProduct.module.css';

const CATEGORIES = [
  { value: '', label: 'Select Category' },
  { value: 'kitchen', label: 'Kitchen' },
  { value: 'snacks', label: 'Snacks' },
  { value: 'beauty', label: 'Beauty' },
  { value: 'bakery', label: 'Bakery' },
  { value: 'household', label: 'Household' }
];

const WEIGHT_OPTIONS = [
  { value: '', label: 'Select Weight' },
  { value: '100g', label: '100g' },
  { value: '250g', label: '250g' },
  { value: '500g', label: '500g' },
  { value: '1kg', label: '1kg' }
];

const SIZE_OPTIONS = [
  { value: '', label: 'Select Size' },
  { value: '250ml', label: '250ml' },
  { value: '500ml', label: '500ml' },
  { value: '1L', label: '1L' },
  { value: '2L', label: '2L' }
];

const AddProduct = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    description: '',
    category: '',
    weight: '',
    size: '',
    price: '',
    discountedPrice: '',
    sku: '',
    isAvailable: true
  });

  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [uploadingSizes, setUploadingSizes] = useState({});
  const [errors, setErrors] = useState({});

  // Handle text input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear field error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  // Handle category change to reset weight/size
  const handleCategoryChange = (e) => {
    const { value } = e.target;
    setFormData(prev => ({
      ...prev,
      category: value,
      weight: '',
      size: ''
    }));
    if (errors.category) {
      setErrors(prev => ({
        ...prev,
        category: null
      }));
    }
  };

  // Handle image selection
  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    const currentCount = images.length;

    if (currentCount + files.length > 5) {
      setError('Maximum 5 images allowed');
      return;
    }

    const validFiles = [];
    const errors = [];

    files.forEach((file, idx) => {
      // Validate file type
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        errors.push(`File ${idx + 1}: Invalid format. Only JPG, PNG, WebP allowed`);
        return;
      }

      // Validate file size (5MB = 5242880 bytes)
      if (file.size > 5242880) {
        errors.push(`File ${idx + 1}: Size exceeds 5MB`);
        return;
      }

      validFiles.push(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, {
          id: Date.now() + idx,
          src: reader.result,
          file: file,
          name: file.name
        }]);
      };
      reader.readAsDataURL(file);
    });

    if (errors.length > 0) {
      setError(errors.join('; '));
    }

    setImages(prev => [...prev, ...validFiles]);
    e.target.value = ''; // Reset input
  };

  // Remove image
  const removeImage = (id) => {
    setImagePreviews(prev => prev.filter(img => img.id !== id));
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Product name is required';
    if (!formData.brand.trim()) newErrors.brand = 'Brand is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.category) newErrors.category = 'Category is required';

    if (formData.category !== 'household' && !formData.weight) {
      newErrors.weight = 'Weight is required for non-household products';
    }
    if (formData.category === 'household' && !formData.size) {
      newErrors.size = 'Size is required for household products';
    }

    if (!formData.price) {
      newErrors.price = 'Price is required';
    } else if (parseFloat(formData.price) <= 0) {
      newErrors.price = 'Price must be greater than 0';
    }

    if (formData.discountedPrice) {
      const price = parseFloat(formData.price);
      const discounted = parseFloat(formData.discountedPrice);
      if (discounted >= price) {
        newErrors.discountedPrice = 'Discounted price must be less than original price';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('adminToken');
      
      // Create FormData for file upload
      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('brand', formData.brand);
      submitData.append('description', formData.description);
      submitData.append('category', formData.category);
      submitData.append('price', formData.price);
      
      if (formData.discountedPrice) {
        submitData.append('discountedPrice', formData.discountedPrice);
      }

      if (formData.category === 'household') {
        submitData.append('size', formData.size);
      } else {
        submitData.append('weight', formData.weight);
      }

      submitData.append('isAvailable', formData.isAvailable);
      submitData.append('shopId', '6996fc58e496cc042fedfa92'); // Default shop ID from seed

      // Add images
      imagePreviews.forEach(img => {
        submitData.append('images', img.file);
      });

      const response = await fetch('http://localhost:5000/api/v1/products', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: submitData
      });

      const result = await response.json();

      if (result.success) {
        setSuccess('Product created successfully!');
        setTimeout(() => {
          navigate('/admin/products');
        }, 1500);
      } else {
        setError(result.message || 'Failed to create product');
      }
    } catch (err) {
      setError('Error creating product: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Add New Product</h1>
        <p className={styles.subtitle}>Create a new product for your store</p>
      </div>

      {error && <div className={styles.errorAlert}>{error}</div>}
      {success && <div className={styles.successAlert}>{success}</div>}

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formSection}>
          <h2>Product Information</h2>

          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label htmlFor="name">Product Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., Stainless Steel Mixing Bowl"
                className={errors.name ? styles.inputError : ''}
              />
              {errors.name && <span className={styles.errorText}>{errors.name}</span>}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="brand">Brand *</label>
              <input
                type="text"
                id="brand"
                name="brand"
                value={formData.brand}
                onChange={handleInputChange}
                placeholder="e.g., HomeChef"
                className={errors.brand ? styles.inputError : ''}
              />
              {errors.brand && <span className={styles.errorText}>{errors.brand}</span>}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="category">Category *</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleCategoryChange}
                className={errors.category ? styles.inputError : ''}
              >
                {CATEGORIES.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
              {errors.category && <span className={styles.errorText}>{errors.category}</span>}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="sku">SKU (Optional)</label>
              <input
                type="text"
                id="sku"
                name="sku"
                value={formData.sku}
                onChange={handleInputChange}
                placeholder="e.g., PROD-001"
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Provide detailed product description..."
              rows="5"
              className={errors.description ? styles.inputError : ''}
            />
            {errors.description && <span className={styles.errorText}>{errors.description}</span>}
          </div>
        </div>

        <div className={styles.formSection}>
          <h2>Pricing & Inventory</h2>

          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label htmlFor="price">Price (₹) *</label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                placeholder="0.00"
                step="0.01"
                min="0"
                className={errors.price ? styles.inputError : ''}
              />
              {errors.price && <span className={styles.errorText}>{errors.price}</span>}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="discountedPrice">Discounted Price (₹) (Optional)</label>
              <input
                type="number"
                id="discountedPrice"
                name="discountedPrice"
                value={formData.discountedPrice}
                onChange={handleInputChange}
                placeholder="0.00"
                step="0.01"
                min="0"
                className={errors.discountedPrice ? styles.inputError : ''}
              />
              {errors.discountedPrice && <span className={styles.errorText}>{errors.discountedPrice}</span>}
            </div>

            {formData.category && formData.category !== 'household' && (
              <div className={styles.formGroup}>
                <label htmlFor="weight">Weight *</label>
                <select
                  id="weight"
                  name="weight"
                  value={formData.weight}
                  onChange={handleInputChange}
                  className={errors.weight ? styles.inputError : ''}
                >
                  {WEIGHT_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                {errors.weight && <span className={styles.errorText}>{errors.weight}</span>}
              </div>
            )}

            {formData.category === 'household' && (
              <div className={styles.formGroup}>
                <label htmlFor="size">Size *</label>
                <select
                  id="size"
                  name="size"
                  value={formData.size}
                  onChange={handleInputChange}
                  className={errors.size ? styles.inputError : ''}
                >
                  {SIZE_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                {errors.size && <span className={styles.errorText}>{errors.size}</span>}
              </div>
            )}
          </div>
        </div>

        <div className={styles.formSection}>
          <h2>Images</h2>
          <p className={styles.imageHint}>
            Upload up to 5 images (JPG, PNG, WebP, max 5MB each)
          </p>

          <div className={styles.imageUploadArea}>
            <input
              type="file"
              id="imageInput"
              multiple
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImageSelect}
              className={styles.fileInput}
              disabled={imagePreviews.length >= 5}
            />
            <label htmlFor="imageInput" className={styles.uploadLabel}>
              <div className={styles.uploadContent}>
                <span>📸 Click to upload or drag & drop</span>
                <small>JPG, PNG or WebP (Max 5MB)</small>
              </div>
            </label>
          </div>

          {imagePreviews.length > 0 && (
            <div className={styles.imagePreviewGrid}>
              {imagePreviews.map(preview => (
                <div key={preview.id} className={styles.previewItem}>
                  <img src={preview.src} alt="preview" className={styles.previewImg} />
                  <button
                    type="button"
                    className={styles.removeBtn}
                    onClick={() => removeImage(preview.id)}
                    title="Remove image"
                  >
                    ✕
                  </button>
                  <div className={styles.fileName}>{preview.name}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={styles.formSection}>
          <h2>Status</h2>
          <div className={styles.statusToggle}>
            <label className={styles.toggleLabel}>
              <input
                type="checkbox"
                name="isAvailable"
                checked={formData.isAvailable}
                onChange={handleInputChange}
                className={styles.toggleInput}
              />
              <span className={styles.toggleSlider}></span>
              <span className={styles.toggleText}>
                {formData.isAvailable ? '✓ Active' : '✕ Inactive'}
              </span>
            </label>
          </div>
        </div>

        <div className={styles.formActions}>
          <button 
            type="submit" 
            className={styles.submitBtn}
            disabled={loading}
          >
            {loading ? 'Creating...' : '+ Create Product'}
          </button>
          <button
            type="button"
            className={styles.cancelBtn}
            onClick={() => navigate('/admin/products')}
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProduct;
