# Image Upload Testing Guide

## 🚀 Quick Start - Test Image Upload Feature

### Prerequisites
✅ Backend running on `http://localhost:5000`  
✅ Frontend running on `http://localhost:5173` or `npm run dev`  

---

## 📋 Step-by-Step Testing

### **Step 1: Admin Login**
```
URL: http://localhost:5173/sign-in
Email: admin@general-store.local
Password: admin123
Checkbox: ✓ Login as Admin
```

### **Step 2: Navigate to Products**
```
Path: /admin → Products
OR Direct: http://localhost:5173/admin/products
```

### **Step 3: Test ADD PRODUCT with Image**

**Click "+ Add Product" button**

1. **Fill Basic Information:**
   - Product Name: `Basmati Rice Premium` (example)
   - Category: Kitchen
   - Description: `Premium aged basmati rice from India`

2. **Upload Image:**
   - Click in the image upload area
   - Select an image file from your device
   - Acceptable formats: JPG, PNG, GIF, WebP
   - Max size: 5MB
   - Should see preview with filename and size

3. **Add Weight Options (REQUIRED):**
   - Click in "Weight Options" section
   - Label: `500g`
   - Value: `0.5`
   - Price: `150`
   - Original Price: `200`
   - Click "Add Weight Option"
   
   Repeat with:
   - Label: `1kg`, Value: `1`, Price: `280`, Original: `350`
   - Label: `2kg`, Value: `2`, Price: `500`, Original: `650`

4. **Submit Product:**
   - Click "Add Product" button
   - Watch for:
     - Toast: "⏳ Uploading image..."
     - Then: "✅ Product added successfully"
   - Image should be uploaded and product created

5. **Verify in Table:**
   - Product appears in table below
   - Image displays in product row
   - All weights show as green badges
   - Stock status shows green (In Stock)

---

### **Step 4: Test EDIT PRODUCT with Image**

1. **Find your newly created product in table**

2. **Click "Edit" button**
   - Edit dialog opens
   - Shows current product image thumbnail
   - All fields pre-filled

3. **Change Product Details:**
   - Edit name: Add " - Updated" to it
   - Or change category

4. **Update Product Image (Optional):**
   - Click on image upload area
   - Select a different image
   - Preview updates
   - Can click "Change" to reselect

5. **Save Changes:**
   - Click "Save Changes"
   - Watch for upload toast if new image selected
   - Toast: "✅ Product updated successfully"
   - Dialog closes

6. **Verify Changes:**
   - Image updated in table
   - Other details updated
   - Product still shows all weights

---

### **Step 5: Test ERROR HANDLING**

**Try to upload invalid file:**
- Click image upload area
- Select a non-image file (TXT, PDF, etc)
- Will see error: "Please select a valid image file"

**Try to upload oversized file:**
- Select image > 5MB
- Will see error: "Image size must be less than 5MB"

**Try to add product without image:**
- Fill all fields
- Don't select image
- Click "Add Product"
- Will see error: "Please select a product image"

**Try to add product without weights:**
- Select image
- Don't add any weights
- Click "Add Product"
- Will see error: "Please add at least one weight option"

---

### **Step 6: View Products in Frontend**

1. **Navigate to home page:** `http://localhost:5173`

2. **Browse your uploaded products:**
   - Products should display with uploaded images
   - Images load correctly in SmartBasketCard
   - Select weight options
   - Add to cart works

---

## 📊 Expected Results

| Feature | Expected | Status |
|---------|----------|--------|
| Image upload | File selector visible | ✅ |
| Image preview | Shows selected image | ✅ |
| File validation | Rejects invalid files | ✅ |
| Size validation | Rejects > 5MB | ✅ |
| Upload endpoint | Returns image URL | ✅ |
| Image display | Shows in table | ✅ |
| Edit image | Can change image | ✅ |
| Frontend display | Shows in products | ✅ |

---

## 🔍 Debugging Tips

### **If images don't appear:**
1. Check browser DevTools (F12) → Network tab
2. Look for `/uploads/products/image-*.jpg` requests
3. Should return 200 status
4. Check Server Console for errors

### **If upload fails:**
1. Check file format (only JPG, PNG, GIF, WebP)
2. Check file size (< 5MB)
3. Check server is running: `http://localhost:5000/health`
4. Check Server logs for detailed error

### **If form shows loading:**
1. Wait for upload to complete
2. Check network speed
3. For large files (> 500KB), upload takes 2-5 seconds

---

## 📁 File Storage

Images stored in:
```
Server/uploads/products/
```

Accessible at:
```
http://localhost:5000/uploads/products/{filename}
```

Example filename:
```
image-1708411234567-987654321.jpg
```

---

## ✅ Test Checklist

- [ ] Can login as admin
- [ ] Image upload area visible
- [ ] Can select and preview image
- [ ] Image preview shows in form
- [ ] Wrong file type rejected
- [ ] Oversized file rejected
- [ ] Product created with image
- [ ] Image appears in table
- [ ] Can edit product
- [ ] Can update product image
- [ ] Images appear on home page
- [ ] SmartBasketCard shows images
- [ ] Add to cart works with product

---

## 🐛 Known Issues & Solutions

**Issue:** Image upload very slow
- **Solution:** Check internet speed, reduce file size using online compressor

**Issue:** Images appear broken in table
- **Solution:** Clear browser cache (Ctrl+Shift+Delete), restart development server

**Issue:** Getting CORS error
- **Solution:** Backend CORS is enabled, check console for more details

---

## 📞 Quick Reference

**Admin Routes:**
- Login: `/sign-in`
- Dashboard: `/admin`
- Products: `/admin/products`
- Orders: `/admin/orders`
- Users: `/admin/users`

**API Endpoints:**
- Upload: `POST http://localhost:5000/api/upload`
- Get Products: `GET http://localhost:5000/api/products`
- Add Product: `POST http://localhost:5000/api/admin/products`
- Edit Product: `PUT http://localhost:5000/api/admin/products/:id`

---

**Test Date:** February 20, 2026  
**Feature Status:** ✅ Production Ready
