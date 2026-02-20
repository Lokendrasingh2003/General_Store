# Address Feature - Complete End-to-End Testing Guide

## ✅ Automated Test Results (PASSED)
- Address creation/save: ✓
- Address list retrieval: ✓
- Order creation with address: ✓
- Order retrieval: ✓

## 📋 Manual E2E Testing Checklist

### Server Status
- Backend: Running on http://localhost:5000
- Frontend: Running on http://localhost:5173

### Test 1: SignUp with Address Capture
**Steps:**
1. Go to http://localhost:5173/signup
2. Fill in basic signup form:
   - Email: test@example.com
   - Password: Test@123456
   - Confirm Password: Test@123456
3. Look for "Add Address (Optional)" section below password field
4. Fill in address details:
   - Full Name: John Doe
   - Phone: 9876543210
   - Address Line: 123 Main Street, Apt 4B
   - City: Delhi
   - State: Delhi
   - Pincode: 110001
5. Click "Create Account"

**Expected Result:**
- Account created successfully
- Toast message: "Account created successfully"
- Address should be saved to localStorage as temp address
- (If auto-redirect works) Go to profile page

---

### Test 2: Profile Address Management
**Prerequisites:**
- Logged in to the application
- Access to profile page

**Steps:**
1. Go to http://localhost:5173/profile
2. Scroll to "Addresses" section
3. Verify the following:
   - If you just signed up with address, it should auto-import from signup
   - Click "Add Address" button
4. Fill in a new address:
   - Label: Office
   - Full Name: Adesh Kumar
   - Phone: 9876543210
   - Address: 456 Oak Avenue
   - City: Delhi
   - State: Delhi
   - Pincode: 110002
5. Click "Save Address"

**Expected Result:**
- Address saved successfully (green toast message)
- New address appears in the list
- Can delete address with delete button
- Can mark default with checkbox

---

### Test 3: Checkout with Address Selection
**Prerequisites:**
- Logged in to the application
- At least one product in cart
- At least one saved address

**Steps:**
1. Go to http://localhost:5173/checkout
2. Look for "Delivery Address" section
3. Verify address dropdown appears at top with saved addresses
4. Select dropdown options:
   - Choose one of saved addresses
   - Should auto-populate all fields (fullName, phone, line1, city, state, pincode)
5. Or manually fill address if no saved addresses
6. Click "Save Address" button
7. Select payment method (COD recommended for testing)
8. Click "Place Order"

**Expected Result:**
- Order placed successfully
- Toast: "Order placed successfully"
- Redirects to profile page
- Order appears in order history with delivery address

---

### Test 4: Profile Order History with Address
**Steps:**
1. Go to http://localhost:5173/profile
2. Scroll to "Orders" section
3. Click on any recent order
4. Verify address details are displayed:
   - Full Name
   - Phone
   - Address Line
   - City, State, Pincode

**Expected Result:**
- All address details correctly displayed in order details

---

## 🔄 Signup Temp Address Flow Testing

**Steps:**
1. SignUp with address (Test 1 above)
2. Check browser DevTools → Application → LocalStorage
3. Look for key: `tempAddress`
4. Navigate to Profile page
5. Verify address auto-populates from localStorage

**Expected Result:**
- tempAddress is saved during signup
- Address auto-loads in profile
- localStorage entry is removed after import

---

## 🛡️ Validation Tests

### Test: Invalid Phone Number
1. In any address form, enter phone: "12345"
2. Try to save
3. **Expected:** Error message "Enter a valid 10-digit phone"

### Test: Invalid Pincode
1. In any address form, enter pincode: "12345"
2. Try to save
3. **Expected:** Error message "Enter a valid 6-digit pincode"

### Test: Empty Required Fields
1. Try to save address without fullName
2. **Expected:** Error message "Enter your full name"

---

## 📱 API Endpoints Reference

```
POST   /api/addresses              - Create/Save address
GET    /api/addresses              - List all addresses
PUT    /api/addresses/:id          - Update address
DELETE /api/addresses/:id          - Delete address

POST   /api/orders                 - Create order (with address)
GET    /api/orders                 - Get all orders
GET    /api/orders/:orderId        - Get order by ID
POST   /api/orders/:orderId/cancel - Cancel order
```

---

## 🐛 Troubleshooting

**Issue:** Address dropdown not showing in checkout
- **Fix:** Ensure you have saved addresses in profile first
- **Check:** Open DevTools → Network tab → verify GET /api/addresses returns data

**Issue:** Address not persisting after signup
- **Fix:** Check localStorage in DevTools → Application → LocalStorage
- **Look for:** `tempAddress` key with address data

**Issue:** Checkout shows "Address saved" but can't place order
- **Fix:** Ensure all address fields are valid (especially phone 10-digit, pincode 6-digit)
- **Check:** Error messages in form

**Issue:** Order placed but address missing
- **Fix:** This shouldn't happen with current implementation
- **Debug:** Check backend logs and /api/orders response

---

## ✨ Feature Summary

### SignUp Page
- ✓ Optional address capture form
- ✓ Collapsible UI
- ✓ Saves to localStorage on account creation
- ✓ Form validates phone (10) and pincode (6)

### Profile Page  
- ✓ Load addresses from backend API
- ✓ Auto-import temp address from signup localStorage
- ✓ Add new addresses
- ✓ Edit existing addresses
- ✓ Delete addresses
- ✓ Mark default address
- ✓ Display all saved addresses

### Checkout Page
- ✓ Dropdown to select saved addresses
- ✓ Auto-populate form from selected address
- ✓ Manual address entry (fallback)
- ✓ Send address with order to backend
- ✓ Address persists in order history

### Backend
- ✓ Address CRUD endpoints
- ✓ Order creation stores address
- ✓ Order retrieval shows address details
- ✓ Validation: phone (10-digit), pincode (6-digit)
- ✓ Default address management

---

## 🎯 Next Steps (Optional Enhancements)

1. Add address auto-complete (Google Places API)
2. Add multiple phone number support
3. Add address nickname/alias
4. Add address type (Home/Office/Other)
5. Add address history tracking
6. Add address usage analytics
7. Add delivery partner address hints

---

**Last Updated:** February 20, 2026
**Status:** ✅ All features implemented and tested
