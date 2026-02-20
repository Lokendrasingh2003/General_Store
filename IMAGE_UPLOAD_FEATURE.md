# Image Upload Feature Documentation

## Overview
The application now supports **direct device image uploads** for admin product management. Images are uploaded to the server's `/uploads/products/` directory and can be accessed via HTTP URLs.

---

## 🎯 Features Implemented

### 1. **Backend Image Upload API**
- **Endpoint:** `POST /api/upload`
- **Field Name:** `image` (multipart/form-data)
- **File Size Limit:** 5MB
- **Supported Formats:** JPG, PNG, GIF, WebP
- **Response:** Returns image URL for immediate use

### 2. **Admin Products Form**
- **Add Product:**
  - Replaced URL input with file input field
  - Shows image preview before upload
  - Upload happens automatically during product creation
  - File validation (type & size)
  
- **Edit Product:**
  - File input with drag-and-drop preview
  - Shows current image thumbnail
  - Optional image update (can keep existing image)

### 3. **Product Display**
- **SmartBasketCard:** Automatically displays uploaded images
- **Product Table:** Shows product images in admin dashboard
- Images fallback to placeholder if not available

---

## 📂 File Structure

```
Server/
├── src/
│   ├── app.js (Updated: Added upload routes & static file serving)
│   ├── config/
│   │   └── upload.js (Image upload configuration)
│   ├── controllers/
│   │   └── uploadController.js (Upload endpoint handlers)
│   ├── routes/
│   │   └── uploadRoutes.js (Upload routes)
│   └── utils/
│       └── imageService.js (Image processing utilities)
└── uploads/
    └── products/ (Uploaded images stored here)

Client/
├── src/
│   └── main-ui/
│       ├── pages/
│       │   └── admin/
│       │       └── AdminProducts.jsx (Updated with file input)
│       └── components/
│           └── Home/
│               └── SmartBasketCard.jsx (Auto-displays images)
```

---

## 🚀 How It Works

### **Adding a Product with Image:**

1. **Admin clicks "Add Product"**
   - Form opens with file input instead of URL input
   - Shows upload preview area

2. **Select Image File**
   - Click or drag & drop image into upload area
   - Real-time preview displayed
   - File validation: Type & Size (max 5MB)

3. **Submit Product**
   - Form validates all fields
   - Image uploaded to `/api/upload` endpoint
   - Gets image URL from response
   - Creates product with image URL
   - Shows success toast notification

### **Editing a Product Image:**

1. **Click Edit button on product**
   - Edit modal opens
   - Displays current product image
   - Shows option to upload new image

2. **Upload New Image (Optional)**
   - Leave blank to keep existing image
   - Or select new image file
   - Preview updates immediately

3. **Save Changes**
   - If new image selected: Upload first
   - Update product with new/existing image URL
   - Modal closes with success

---

## 💻 API Endpoints

### **POST /api/upload**
Upload a single image

**Request:**
```
Content-Type: multipart/form-data
Body:
  - image: File (image file)
```

**Response:**
```json
{
  "success": true,
  "message": "Image uploaded successfully",
  "data": {
    "filename": "image-1708411234567-123456789.jpg",
    "url": "/uploads/products/image-1708411234567-123456789.jpg",
    "path": "uploads/products/image-1708411234567-123456789.jpg",
    "size": 245632,
    "mimetype": "image/jpeg",
    "uploadedAt": "2024-02-20T10:00:00.000Z"
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "File size exceeds maximum allowed (5MB)"
}
```

---

## ⚙️ Configuration

### **File Size Limits** (`src/config/upload.js`)
```javascript
const FILE_SIZE_LIMITS = {
  product: 5 * 1024 * 1024,     // 5MB
  profile: 2 * 1024 * 1024,     // 2MB
  banner: 10 * 1024 * 1024      // 10MB
};
```

### **Allowed File Types**
```javascript
const ALLOWED_MIMETYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp'
];

const ALLOWED_EXTENSIONS = [
  '.jpg', '.jpeg', '.png', '.gif', '.webp'
];
```

---

## 🖼️ Image URLs

Uploaded images are accessible via:
```
http://localhost:5000/uploads/products/{filename}
```

Example:
```
http://localhost:5000/uploads/products/image-1708411234567-123456789.jpg
```

---

## ✅ Testing the Feature

### **Admin Panel**
1. Navigate to: `/sign-in`
2. Check **"Login as Admin"** checkbox
3. Use credentials:
   - Email: `admin@general-store.local`
   - Password: `admin123`
4. Go to: `/admin/products`

### **Add Product**
1. Click **"+ Add Product"** button
2. Fill product details
3. **Click image upload area** to select file
4. Verify preview shows selected image
5. Add weight options (required)
6. Click **"Add Product"**
7. Watch image upload and product creation

### **Edit Product**
1. Click **"Edit"** button on any product
2. Edit modal opens with current image
3. Click on image area to upload new image
4. (Optional) Upload new image
5. Modify other fields as needed
6. Click **"Save Changes"**

### **View Products**
1. Products display with uploaded images
2. Images appear correctly in:
   - Admin Products table
   - SmartBasketCard components on home page

---

## 🔧 Backend Dependencies

Added package:
```
multer: ^5.0.0 (File upload middleware)
```

Install with:
```bash
npm install multer
```

---

## 📝 Code Changes Summary

### **Frontend - AdminProducts.jsx**
- Added file input states: `imageFile`, `imagePreview`, `uploading`
- Added functions: `handleImageSelect()`, `uploadImage()`
- Updated `handleAddProduct()` to upload image first
- Replaced URL input with file input + preview
- Updated edit modal with file upload

### **Backend - app.js**
- Added static file serving: `app.use('/uploads', express.static())`
- Registered upload routes: `app.use('/api/upload', uploadRoutes)`

### **Backend - Upload Routes**
- `POST /api/upload` - Single image upload
- `POST /api/upload/batch` - Multiple images upload

---

## 🎨 UI Components

### **Add Form - Image Upload**
```jsx
<div className="border-2 border-dashed border-stone-300 rounded-lg p-6">
  <input type="file" accept="image/*" />
  {imagePreview && <img src={imagePreview} alt="Preview" />}
</div>
```

### **Edit Modal - Image Upload**
```jsx
<Box sx={{ border: '2px dashed #ddd' }}>
  <input type="file" accept="image/*" />
  {editImagePreview && <img src={editImagePreview} alt="Preview" />}
</Box>
```

---

## 🎯 Next Steps

Future enhancements:
- [ ] Image compression/optimization
- [ ] Multiple product images per variant
- [ ] Image cropping tool
- [ ] Cloudinary/S3 integration
- [ ] Image gallery in product details
- [ ] Bulk image upload

---

## 📞 Support & Troubleshooting

### **Images Not Displaying**
1. Check upload response for `/uploads/products/` URL
2. Verify backend is running on port 5000
3. Check browser console for image load errors

### **Upload Fails**
1. Check file size (< 5MB)
2. Check file format (JPG, PNG, GIF, WebP)
3. Check server logs for errors

### **Port Already in Use**
```bash
# Change port in Server/.env
PORT=5001
```

---

**Created:** February 20, 2026  
**Last Updated:** February 20, 2026  
**Status:** ✅ Fully Implemented & Tested
