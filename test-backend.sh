#!/bin/bash
# Test Backend API Endpoints

echo "Testing backend API endpoints..."
echo ""

# Base URL
BASE_URL="http://localhost:3000/api/v1"

# Test health endpoint (if exists)
echo "Testing health check..."
curl -s -o /dev/null -w "Health Check: %{http_code}\n" $BASE_URL/health 2>/dev/null || echo "Health endpoint not found (expected)"

# Test auth endpoints
echo ""
echo "Testing auth endpoints..."
curl -s -o /dev/null -w "POST /auth/signup: %{http_code}\n" -X POST $BASE_URL/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","username":"testuser","password":"Test123!"}' 2>/dev/null

curl -s -o /dev/null -w "POST /auth/login: %{http_code}\n" -X POST $BASE_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!"}' 2>/dev/null

echo ""
echo "Note: 4xx errors are expected for auth endpoints without valid data"
echo "5xx errors indicate server problems"
