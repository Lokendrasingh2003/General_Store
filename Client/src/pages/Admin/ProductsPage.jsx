import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './ProductsList.module.css';
import ConfirmDeleteModal from '../../components/Admin/ConfirmDeleteModal.jsx';

const CATEGORIES = [
  { value: '', label: 'All Categories' },
  { value: 'kitchen', label: 'Kitchen' },
  { value: 'snacks', label: 'Snacks' },
  { value: 'beauty', label: 'Beauty' },
  { value: 'bakery', label: 'Bakery' },
  { value: 'household', label: 'Household' }
];

const ITEMS_PER_PAGE = 10;

const ProductsPage = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);

  // Delete modal state
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    productId: null,
    productName: null
  });
  const [deleting, setDeleting] = useState(false);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('adminToken');
        const response = await fetch('http://localhost:5000/api/v1/admin/products/', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        
        if (data.success) {
          setProducts(data.data || []);
          setError(null);
        } else {
          setError(data.message || 'Failed to fetch products');
        }
      } catch (err) {
        setError('Error fetching products: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Filter and sort products
  useEffect(() => {
    let result = [...products];

    // Search filter
    if (searchTerm) {
      result = result.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory) {
      result = result.filter(product => product.category === selectedCategory);
    }

    // Sort
    switch (sortBy) {
      case 'name-asc':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'price-low':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
      default:
        result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
    }

    setFilteredProducts(result);
    setCurrentPage(1); // Reset to first page
  }, [products, searchTerm, selectedCategory, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleDelete = (productId, productName) => {
    setDeleteModal({
      isOpen: true,
      productId,
      productName
    });
  };

  const confirmDelete = async () => {
    if (!deleteModal.productId) return;

    setDeleting(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(
        `http://localhost:5000/api/v1/products/${deleteModal.productId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const result = await response.json();

      if (result.success) {
        // Remove product from list
        setProducts(prev => prev.filter(p => p._id !== deleteModal.productId));
        setSuccess(`"${deleteModal.productName}" deleted successfully!`);
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(null), 3000);
        
        // Close modal
        setDeleteModal({ isOpen: false, productId: null, productName: null });
      } else {
        setError(result.message || 'Failed to delete product');
      }
    } catch (err) {
      setError('Error deleting product: ' + err.message);
      console.error('Delete error:', err);
    } finally {
      setDeleting(false);
    }
  };

  const cancelDelete = () => {
    setDeleteModal({ isOpen: false, productId: null, productName: null });
  };

  const getCategoryLabel = (category) => {
    return CATEGORIES.find(cat => cat.value === category)?.label || category;
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(price);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1>Products</h1>
          <p className={styles.subtitle}>Manage your product inventory</p>
        </div>
        <button className={styles.addBtn} onClick={() => navigate('/admin/products/add')}>+ Add New Product</button>
      </div>

      {error && <div className={styles.errorAlert}>{error}</div>}
      {success && <div className={styles.successAlert}>{success}</div>}

      {/* Filters and Search */}
      <div className={styles.filterSection}>
        <div className={styles.searchBox}>
          <input
            type="text"
            placeholder="Search products by name or brand..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.controls}>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className={styles.select}
          >
            {CATEGORIES.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className={styles.select}
          >
            <option value="newest">Newest First</option>
            <option value="name-asc">Name (A-Z)</option>
            <option value="name-desc">Name (Z-A)</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>

        <div className={styles.resultCount}>
          Showing {filteredProducts.length > 0 ? startIndex + 1 : 0} to {Math.min(startIndex + ITEMS_PER_PAGE, filteredProducts.length)} of {filteredProducts.length} products
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className={styles.emptyState}>
          <div className={styles.spinner}></div>
          <p>Loading products...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className={styles.errorState}>
          <p>⚠️ {error}</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredProducts.length === 0 && (
        <div className={styles.emptyState}>
          <p>📦 No products found</p>
          <small>Try adjusting your search or filters</small>
        </div>
      )}

      {/* Products Table - Desktop View */}
      {!loading && !error && filteredProducts.length > 0 && (
        <>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Name</th>
                  <th>Brand</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedProducts.map(product => (
                  <tr key={product._id} className={styles.row}>
                    <td>
                      <div className={styles.imageCell}>
                        {product.images && product.images[0] ? (
                          <img src={product.images[0]} alt={product.name} />
                        ) : (
                          <div className={styles.imagePlaceholder}>No Image</div>
                        )}
                      </div>
                    </td>
                    <td className={styles.nameCell}>
                      <div className={styles.productName}>{product.name}</div>
                    </td>
                    <td>{product.brand}</td>
                    <td>
                      <span className={styles.badge}>{getCategoryLabel(product.category)}</span>
                    </td>
                    <td>
                      <div className={styles.priceCell}>
                        <div>{formatPrice(product.price)}</div>
                        {product.discountedPrice && (
                          <div className={styles.discountedPrice}>
                            {formatPrice(product.discountedPrice)}
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className={`${styles.status} ${product.isAvailable ? styles.active : styles.inactive}`}>
                        {product.isAvailable ? '✓ Active' : '✕ Inactive'}
                      </span>
                    </td>
                    <td>
                      <div className={styles.actions}>
                        <button className={styles.btnView} title="View">👁️</button>
                        <button 
                          className={styles.btnEdit} 
                          title="Edit"
                          onClick={() => navigate(`/admin/products/edit/${product._id}`)}
                        >
                          ✏️
                        </button>
                        <button
                          className={styles.btnDelete}
                          title="Delete"
                          onClick={() => handleDelete(product._id, product.name)}
                          disabled={deleting}
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(1)}
                className={styles.pageBtn}
              >
                « First
              </button>
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
                className={styles.pageBtn}
              >
                ‹ Previous
              </button>

              <div className={styles.pageInfo}>
                Page {currentPage} of {totalPages}
              </div>

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
                className={styles.pageBtn}
              >
                Next ›
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(totalPages)}
                className={styles.pageBtn}
              >
                Last »
              </button>
            </div>
          )}
        </>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={deleteModal.isOpen}
        title="Delete Product"
        message="Are you sure you want to delete this product? This action cannot be undone."
        itemName={deleteModal.productName}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        isLoading={deleting}
      />
    </div>
  );
};

export default ProductsPage;
