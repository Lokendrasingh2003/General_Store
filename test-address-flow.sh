#!/bin/bash

# Test Address Management Flow
# Tests signup, profile address save/list, and checkout address selection

BASE_URL="http://localhost:5000"

echo "=================================="
echo "Address Flow E2E Test"
echo "=================================="

# Test 1: Save Address (POST /api/addresses)
echo ""
echo "TEST 1: Save Address"
echo "---"
curl -X POST "${BASE_URL}/api/addresses" \
  -H "Content-Type: application/json" \
  -d '{
    "label": "Home",
    "name": "Adesh Kumar",
    "phone": "9876543210",
    "line1": "123 Main Street",
    "city": "Delhi",
    "state": "Delhi",
    "pincode": "110001",
    "isDefault": true
  }' | jq .

# Test 2: Get Addresses (GET /api/addresses)
echo ""
echo ""
echo "TEST 2: Get Addresses"
echo "---"
curl -X GET "${BASE_URL}/api/addresses" \
  -H "Content-Type: application/json" | jq .

# Test 3: Update Address (PUT /api/addresses/:id)
echo ""
echo ""
echo "TEST 3: Update Address (after getting ID from test 2)"
echo "---"
# Extract first address ID from previous response
ADDRESS_ID=$(curl -s -X GET "${BASE_URL}/api/addresses" | jq -r '.data[0].id')
echo "Using Address ID: $ADDRESS_ID"

if [ "$ADDRESS_ID" != "null" ] && [ ! -z "$ADDRESS_ID" ]; then
  curl -X PUT "${BASE_URL}/api/addresses/${ADDRESS_ID}" \
    -H "Content-Type: application/json" \
    -d '{
      "label": "Home Updated",
      "name": "Adesh Kumar Singh",
      "phone": "9876543211",
      "line1": "456 Updated Street",
      "city": "Delhi",
      "state": "Delhi",
      "pincode": "110002",
      "isDefault": true
    }' | jq .
else
  echo "No address found to update"
fi

# Test 4: Create Order with Address
echo ""
echo ""
echo "TEST 4: Create Order with Address"
echo "---"
curl -X POST "${BASE_URL}/api/orders" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {
        "id": "product-1",
        "name": "Test Product",
        "price": 500,
        "originalPrice": 799,
        "quantity": 1
      }
    ],
    "address": {
      "fullName": "Adesh Kumar",
      "phone": "9876543210",
      "line1": "123 Main Street",
      "city": "Delhi",
      "state": "Delhi",
      "pincode": "110001"
    },
    "paymentMethod": "cod"
  }' | jq .

# Test 5: Get Orders
echo ""
echo ""
echo "TEST 5: Get Orders"
echo "---"
curl -X GET "${BASE_URL}/api/orders" \
  -H "Content-Type: application/json" | jq .

echo ""
echo "=================================="
echo "Tests Complete!"
echo "=================================="
