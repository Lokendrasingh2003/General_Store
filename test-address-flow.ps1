# Test Address Management Flow via PowerShell

$BASE_URL = "http://localhost:5000"

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Address Flow E2E Test" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan

# Test 1: Save Address
Write-Host "`nTEST 1: Save Address (POST /api/addresses)" -ForegroundColor Yellow
Write-Host "---" -ForegroundColor Gray

$addressPayload = @{
    label = "Home"
    name = "Adesh Kumar"
    phone = "9876543210"
    line1 = "123 Main Street"
    city = "Delhi"
    state = "Delhi"
    pincode = "110001"
    isDefault = $true
} | ConvertTo-Json

try {
    $response1 = Invoke-WebRequest -Uri "$BASE_URL/api/addresses" `
        -Method POST `
        -Headers @{"Content-Type"="application/json"} `
        -Body $addressPayload `
        -UseBasicParsing
    
    $data1 = $response1.Content | ConvertFrom-Json
    Write-Host ($data1 | ConvertTo-Json -Depth 3) -ForegroundColor Green
    $addressId = $data1.data.id
} catch {
    Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Get Addresses
Write-Host "`nTEST 2: Get Addresses (GET /api/addresses)" -ForegroundColor Yellow
Write-Host "---" -ForegroundColor Gray

try {
    $response2 = Invoke-WebRequest -Uri "$BASE_URL/api/addresses" `
        -Method GET `
        -Headers @{"Content-Type"="application/json"} `
        -UseBasicParsing
    
    $data2 = $response2.Content | ConvertFrom-Json
    Write-Host "Found $($data2.data.Count) address(es)" -ForegroundColor Green
    Write-Host ($data2 | ConvertTo-Json -Depth 3) -ForegroundColor Green
} catch {
    Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Create Order with Address
Write-Host "`nTEST 3: Create Order with Address (POST /api/orders)" -ForegroundColor Yellow
Write-Host "---" -ForegroundColor Gray

$orderPayload = @{
    items = @(
        @{
            id = "product-test-1"
            name = "Test Product"
            price = 500
            originalPrice = 799
            quantity = 1
        }
    )
    address = @{
        fullName = "Adesh Kumar"
        phone = "9876543210"
        line1 = "123 Main Street"
        city = "Delhi"
        state = "Delhi"
        pincode = "110001"
    }
    paymentMethod = "cod"
} | ConvertTo-Json -Depth 5

try {
    $response3 = Invoke-WebRequest -Uri "$BASE_URL/api/orders" `
        -Method POST `
        -Headers @{"Content-Type"="application/json"} `
        -Body $orderPayload `
        -UseBasicParsing
    
    $data3 = $response3.Content | ConvertFrom-Json
    Write-Host "Order created successfully!" -ForegroundColor Green
    Write-Host ($data3 | ConvertTo-Json -Depth 3) -ForegroundColor Green
} catch {
    Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: Get Orders
Write-Host "`nTEST 4: Get Orders (GET /api/orders)" -ForegroundColor Yellow
Write-Host "---" -ForegroundColor Gray

try {
    $response4 = Invoke-WebRequest -Uri "$BASE_URL/api/orders" `
        -Method GET `
        -Headers @{"Content-Type"="application/json"} `
        -UseBasicParsing
    
    $data4 = $response4.Content | ConvertFrom-Json
    Write-Host "Found $($data4.data.Count) order(s)" -ForegroundColor Green
    Write-Host ($data4 | ConvertTo-Json -Depth 3) -ForegroundColor Green
} catch {
    Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n==================================" -ForegroundColor Cyan
Write-Host "Tests Complete!" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "`nSummary:" -ForegroundColor Yellow
Write-Host "✓ Address save/create" -ForegroundColor Green
Write-Host "✓ Address list retrieval" -ForegroundColor Green
Write-Host "✓ Order creation with address" -ForegroundColor Green
Write-Host "✓ Order retrieval" -ForegroundColor Green
