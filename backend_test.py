#!/usr/bin/env python3
"""
Comprehensive backend API test suite for DevLearn Pro
Tests all endpoints as specified in the review request
"""

import requests
import json
import time
from datetime import datetime

# Base URL from .env
BASE_URL = "https://devlearn-pro.preview.emergentagent.com/api"

# Generate unique test user ID
TEST_USER_ID = f"test-user-{int(time.time())}"
print(f"\n{'='*80}")
print(f"DevLearn Pro Backend API Test Suite")
print(f"{'='*80}")
print(f"Base URL: {BASE_URL}")
print(f"Test User ID: {TEST_USER_ID}")
print(f"{'='*80}\n")

# Test counters
tests_passed = 0
tests_failed = 0
test_results = []

def log_test(name, passed, details=""):
    global tests_passed, tests_failed
    status = "✅ PASS" if passed else "❌ FAIL"
    print(f"{status} | {name}")
    if details:
        print(f"     {details}")
    test_results.append({"name": name, "passed": passed, "details": details})
    if passed:
        tests_passed += 1
    else:
        tests_failed += 1

# Test 1: GET /api/health
print("\n[TEST 1] GET /api/health")
try:
    response = requests.get(f"{BASE_URL}/health", timeout=10)
    data = response.json()
    passed = (
        response.status_code == 200 and
        data.get("ok") == True and
        data.get("service") == "DevLearn Pro API"
    )
    log_test("GET /api/health", passed, f"Response: {data}")
except Exception as e:
    log_test("GET /api/health", False, f"Error: {str(e)}")

# Test 2: GET /api/catalog
print("\n[TEST 2] GET /api/catalog")
try:
    response = requests.get(f"{BASE_URL}/catalog", timeout=10)
    data = response.json()
    has_categories = isinstance(data.get("categories"), list) and len(data["categories"]) >= 12
    has_testimonials = isinstance(data.get("testimonials"), list)
    has_live_batches = isinstance(data.get("liveBatches"), list)
    has_faqs = isinstance(data.get("faqs"), list)
    has_stats = isinstance(data.get("stats"), dict)
    
    # Verify category structure
    category_valid = False
    if has_categories and len(data["categories"]) > 0:
        cat = data["categories"][0]
        category_valid = all(k in cat for k in ["slug", "name", "icon", "color"])
    
    passed = (
        response.status_code == 200 and
        has_categories and
        has_testimonials and
        has_live_batches and
        has_faqs and
        has_stats and
        category_valid
    )
    log_test("GET /api/catalog", passed, 
             f"Categories: {len(data.get('categories', []))}, Testimonials: {len(data.get('testimonials', []))}")
except Exception as e:
    log_test("GET /api/catalog", False, f"Error: {str(e)}")

# Test 3a: GET /api/courses (no query)
print("\n[TEST 3a] GET /api/courses (no query)")
try:
    response = requests.get(f"{BASE_URL}/courses", timeout=10)
    data = response.json()
    courses = data.get("courses", [])
    passed = (
        response.status_code == 200 and
        len(courses) == 6 and
        all(k in courses[0] for k in ["slug", "title", "price", "originalPrice", "discount", "thumbnail", "instructor", "curriculum"])
    )
    log_test("GET /api/courses (default)", passed, f"Returned {len(courses)} courses")
except Exception as e:
    log_test("GET /api/courses (default)", False, f"Error: {str(e)}")

# Test 3b: GET /api/courses?category=ai
print("\n[TEST 3b] GET /api/courses?category=ai")
try:
    response = requests.get(f"{BASE_URL}/courses?category=ai", timeout=10)
    data = response.json()
    courses = data.get("courses", [])
    all_ai = all(c.get("category") == "ai" for c in courses)
    passed = response.status_code == 200 and len(courses) > 0 and all_ai
    log_test("GET /api/courses?category=ai", passed, f"Returned {len(courses)} AI courses")
except Exception as e:
    log_test("GET /api/courses?category=ai", False, f"Error: {str(e)}")

# Test 3c: GET /api/courses?level=Advanced
print("\n[TEST 3c] GET /api/courses?level=Advanced")
try:
    response = requests.get(f"{BASE_URL}/courses?level=Advanced", timeout=10)
    data = response.json()
    courses = data.get("courses", [])
    all_advanced = all(c.get("level") == "Advanced" for c in courses)
    passed = response.status_code == 200 and len(courses) > 0 and all_advanced
    log_test("GET /api/courses?level=Advanced", passed, f"Returned {len(courses)} Advanced courses")
except Exception as e:
    log_test("GET /api/courses?level=Advanced", False, f"Error: {str(e)}")

# Test 3d: GET /api/courses?q=react
print("\n[TEST 3d] GET /api/courses?q=react")
try:
    response = requests.get(f"{BASE_URL}/courses?q=react", timeout=10)
    data = response.json()
    courses = data.get("courses", [])
    has_react = any("react" in c.get("title", "").lower() or "react" in str(c.get("skills", [])).lower() for c in courses)
    passed = response.status_code == 200 and len(courses) > 0 and has_react
    log_test("GET /api/courses?q=react", passed, f"Returned {len(courses)} courses matching 'react'")
except Exception as e:
    log_test("GET /api/courses?q=react", False, f"Error: {str(e)}")

# Test 3e: GET /api/courses?sort=price-low
print("\n[TEST 3e] GET /api/courses?sort=price-low")
try:
    response = requests.get(f"{BASE_URL}/courses?sort=price-low", timeout=10)
    data = response.json()
    courses = data.get("courses", [])
    prices = [c.get("price", 0) for c in courses]
    is_sorted = prices == sorted(prices)
    passed = response.status_code == 200 and len(courses) > 0 and is_sorted
    log_test("GET /api/courses?sort=price-low", passed, f"Prices: {prices}")
except Exception as e:
    log_test("GET /api/courses?sort=price-low", False, f"Error: {str(e)}")

# Test 3f: GET /api/courses?sort=rating
print("\n[TEST 3f] GET /api/courses?sort=rating")
try:
    response = requests.get(f"{BASE_URL}/courses?sort=rating", timeout=10)
    data = response.json()
    courses = data.get("courses", [])
    ratings = [c.get("rating", 0) for c in courses]
    is_sorted = ratings == sorted(ratings, reverse=True)
    passed = response.status_code == 200 and len(courses) > 0 and is_sorted
    log_test("GET /api/courses?sort=rating", passed, f"Ratings: {ratings}")
except Exception as e:
    log_test("GET /api/courses?sort=rating", False, f"Error: {str(e)}")

# Test 4a: GET /api/courses/sap-cpi-integration-mastery
print("\n[TEST 4a] GET /api/courses/sap-cpi-integration-mastery")
try:
    response = requests.get(f"{BASE_URL}/courses/sap-cpi-integration-mastery", timeout=10)
    data = response.json()
    course = data.get("course", {})
    has_curriculum = isinstance(course.get("curriculum"), list) and len(course["curriculum"]) > 0
    has_modules = False
    if has_curriculum:
        module = course["curriculum"][0]
        has_modules = "lessons" in module and isinstance(module["lessons"], list)
    passed = (
        response.status_code == 200 and
        course.get("slug") == "sap-cpi-integration-mastery" and
        has_curriculum and
        has_modules
    )
    log_test("GET /api/courses/sap-cpi-integration-mastery", passed, 
             f"Modules: {len(course.get('curriculum', []))}")
except Exception as e:
    log_test("GET /api/courses/sap-cpi-integration-mastery", False, f"Error: {str(e)}")

# Test 4b: GET /api/courses/does-not-exist (404)
print("\n[TEST 4b] GET /api/courses/does-not-exist (404)")
try:
    response = requests.get(f"{BASE_URL}/courses/does-not-exist", timeout=10)
    data = response.json()
    passed = response.status_code == 404 and "error" in data
    log_test("GET /api/courses/does-not-exist", passed, f"Response: {data}")
except Exception as e:
    log_test("GET /api/courses/does-not-exist", False, f"Error: {str(e)}")

# Test 5a: POST /api/enroll (first time)
print("\n[TEST 5a] POST /api/enroll (first enrollment)")
try:
    payload = {"userId": TEST_USER_ID, "courseSlug": "sap-cpi-integration-mastery"}
    response = requests.post(f"{BASE_URL}/enroll", json=payload, timeout=10)
    data = response.json()
    enrollment = data.get("enrollment", {})
    passed = (
        response.status_code == 200 and
        data.get("ok") == True and
        enrollment.get("userId") == TEST_USER_ID and
        enrollment.get("courseSlug") == "sap-cpi-integration-mastery" and
        enrollment.get("progress") == 0
    )
    log_test("POST /api/enroll (first)", passed, f"Progress: {enrollment.get('progress')}")
except Exception as e:
    log_test("POST /api/enroll (first)", False, f"Error: {str(e)}")

# Test 5b: POST /api/enroll (duplicate - idempotent)
print("\n[TEST 5b] POST /api/enroll (duplicate)")
try:
    payload = {"userId": TEST_USER_ID, "courseSlug": "sap-cpi-integration-mastery"}
    response = requests.post(f"{BASE_URL}/enroll", json=payload, timeout=10)
    data = response.json()
    passed = (
        response.status_code == 200 and
        data.get("ok") == True and
        data.get("existed") == True
    )
    log_test("POST /api/enroll (duplicate)", passed, f"Existed: {data.get('existed')}")
except Exception as e:
    log_test("POST /api/enroll (duplicate)", False, f"Error: {str(e)}")

# Test 6: GET /api/enrollments?userId=...
print("\n[TEST 6] GET /api/enrollments")
try:
    response = requests.get(f"{BASE_URL}/enrollments?userId={TEST_USER_ID}", timeout=10)
    data = response.json()
    enrollments = data.get("enrollments", [])
    has_course = len(enrollments) > 0 and "course" in enrollments[0]
    passed = (
        response.status_code == 200 and
        len(enrollments) > 0 and
        enrollments[0].get("userId") == TEST_USER_ID and
        has_course
    )
    log_test("GET /api/enrollments", passed, f"Found {len(enrollments)} enrollments")
except Exception as e:
    log_test("GET /api/enrollments", False, f"Error: {str(e)}")

# Test 7a: POST /api/progress (mark lesson complete)
print("\n[TEST 7a] POST /api/progress (mark m1l1 complete)")
try:
    payload = {
        "userId": TEST_USER_ID,
        "courseSlug": "sap-cpi-integration-mastery",
        "lessonId": "m1l1",
        "completed": True
    }
    response = requests.post(f"{BASE_URL}/progress", json=payload, timeout=10)
    data = response.json()
    passed = (
        response.status_code == 200 and
        data.get("ok") == True and
        "m1l1" in data.get("completedLessons", []) and
        data.get("progress", 0) > 0
    )
    progress_after_one = data.get("progress", 0)
    log_test("POST /api/progress (complete)", passed, 
             f"Progress: {progress_after_one}%, Completed: {data.get('completedLessons')}")
except Exception as e:
    log_test("POST /api/progress (complete)", False, f"Error: {str(e)}")

# Test 7b: GET /api/progress
print("\n[TEST 7b] GET /api/progress")
try:
    response = requests.get(
        f"{BASE_URL}/progress?userId={TEST_USER_ID}&courseSlug=sap-cpi-integration-mastery",
        timeout=10
    )
    data = response.json()
    passed = (
        response.status_code == 200 and
        "m1l1" in data.get("completedLessons", []) and
        data.get("progress", 0) > 0
    )
    log_test("GET /api/progress", passed, 
             f"Progress: {data.get('progress')}%, Completed: {data.get('completedLessons')}")
except Exception as e:
    log_test("GET /api/progress", False, f"Error: {str(e)}")

# Test 7c: POST /api/progress (mark lesson incomplete)
print("\n[TEST 7c] POST /api/progress (mark m1l1 incomplete)")
try:
    payload = {
        "userId": TEST_USER_ID,
        "courseSlug": "sap-cpi-integration-mastery",
        "lessonId": "m1l1",
        "completed": False
    }
    response = requests.post(f"{BASE_URL}/progress", json=payload, timeout=10)
    data = response.json()
    passed = (
        response.status_code == 200 and
        data.get("ok") == True and
        "m1l1" not in data.get("completedLessons", []) and
        data.get("progress") == 0
    )
    log_test("POST /api/progress (incomplete)", passed, 
             f"Progress: {data.get('progress')}%, Completed: {data.get('completedLessons')}")
except Exception as e:
    log_test("POST /api/progress (incomplete)", False, f"Error: {str(e)}")

# Test 7d: POST /api/progress (mark two lessons complete)
print("\n[TEST 7d] POST /api/progress (mark m1l1 and m1l2 complete)")
try:
    # Mark m1l1
    payload1 = {
        "userId": TEST_USER_ID,
        "courseSlug": "sap-cpi-integration-mastery",
        "lessonId": "m1l1",
        "completed": True
    }
    requests.post(f"{BASE_URL}/progress", json=payload1, timeout=10)
    
    # Mark m1l2
    payload2 = {
        "userId": TEST_USER_ID,
        "courseSlug": "sap-cpi-integration-mastery",
        "lessonId": "m1l2",
        "completed": True
    }
    response = requests.post(f"{BASE_URL}/progress", json=payload2, timeout=10)
    data = response.json()
    completed = data.get("completedLessons", [])
    passed = (
        response.status_code == 200 and
        data.get("ok") == True and
        "m1l1" in completed and
        "m1l2" in completed and
        len(completed) == 2 and
        data.get("progress", 0) > 0
    )
    log_test("POST /api/progress (two lessons)", passed, 
             f"Progress: {data.get('progress')}%, Completed: {completed}")
except Exception as e:
    log_test("POST /api/progress (two lessons)", False, f"Error: {str(e)}")

# Test 8a: POST /api/notes (create)
print("\n[TEST 8a] POST /api/notes (create)")
try:
    payload = {
        "userId": TEST_USER_ID,
        "courseSlug": "sap-cpi-integration-mastery",
        "lessonId": "m1l1",
        "content": "This is my first note about SAP CPI integration patterns"
    }
    response = requests.post(f"{BASE_URL}/notes", json=payload, timeout=10)
    data = response.json()
    passed = response.status_code == 200 and data.get("ok") == True
    log_test("POST /api/notes (create)", passed, f"Response: {data}")
except Exception as e:
    log_test("POST /api/notes (create)", False, f"Error: {str(e)}")

# Test 8b: GET /api/notes
print("\n[TEST 8b] GET /api/notes")
try:
    response = requests.get(
        f"{BASE_URL}/notes?userId={TEST_USER_ID}&courseSlug=sap-cpi-integration-mastery&lessonId=m1l1",
        timeout=10
    )
    data = response.json()
    note = data.get("note", {})
    passed = (
        response.status_code == 200 and
        note is not None and
        "SAP CPI integration patterns" in note.get("content", "")
    )
    log_test("GET /api/notes", passed, f"Content: {note.get('content', '')[:50]}...")
except Exception as e:
    log_test("GET /api/notes", False, f"Error: {str(e)}")

# Test 8c: POST /api/notes (update)
print("\n[TEST 8c] POST /api/notes (update)")
try:
    payload = {
        "userId": TEST_USER_ID,
        "courseSlug": "sap-cpi-integration-mastery",
        "lessonId": "m1l1",
        "content": "Updated note: Advanced SAP CPI patterns and best practices"
    }
    response = requests.post(f"{BASE_URL}/notes", json=payload, timeout=10)
    data = response.json()
    
    # Verify update
    get_response = requests.get(
        f"{BASE_URL}/notes?userId={TEST_USER_ID}&courseSlug=sap-cpi-integration-mastery&lessonId=m1l1",
        timeout=10
    )
    get_data = get_response.json()
    note = get_data.get("note", {})
    
    passed = (
        response.status_code == 200 and
        data.get("ok") == True and
        "Advanced SAP CPI patterns" in note.get("content", "")
    )
    log_test("POST /api/notes (update)", passed, f"Updated content: {note.get('content', '')[:50]}...")
except Exception as e:
    log_test("POST /api/notes (update)", False, f"Error: {str(e)}")

# Test 9a: POST /api/wishlist (add)
print("\n[TEST 9a] POST /api/wishlist (add)")
try:
    payload = {
        "userId": TEST_USER_ID,
        "courseSlug": "aws-solutions-architect-pro"
    }
    response = requests.post(f"{BASE_URL}/wishlist", json=payload, timeout=10)
    data = response.json()
    passed = response.status_code == 200 and data.get("ok") == True
    log_test("POST /api/wishlist (add)", passed, f"Response: {data}")
except Exception as e:
    log_test("POST /api/wishlist (add)", False, f"Error: {str(e)}")

# Test 9b: GET /api/wishlist
print("\n[TEST 9b] GET /api/wishlist")
try:
    response = requests.get(f"{BASE_URL}/wishlist?userId={TEST_USER_ID}", timeout=10)
    data = response.json()
    wishlist = data.get("wishlist", [])
    has_course = len(wishlist) > 0 and wishlist[0].get("courseSlug") == "aws-solutions-architect-pro"
    passed = response.status_code == 200 and len(wishlist) > 0 and has_course
    log_test("GET /api/wishlist", passed, f"Found {len(wishlist)} items")
except Exception as e:
    log_test("GET /api/wishlist", False, f"Error: {str(e)}")

# Test 9c: POST /api/wishlist (remove)
print("\n[TEST 9c] POST /api/wishlist (remove)")
try:
    payload = {
        "userId": TEST_USER_ID,
        "courseSlug": "aws-solutions-architect-pro",
        "action": "remove"
    }
    response = requests.post(f"{BASE_URL}/wishlist", json=payload, timeout=10)
    data = response.json()
    
    # Verify removal
    get_response = requests.get(f"{BASE_URL}/wishlist?userId={TEST_USER_ID}", timeout=10)
    get_data = get_response.json()
    wishlist = get_data.get("wishlist", [])
    
    passed = (
        response.status_code == 200 and
        data.get("ok") == True and
        len(wishlist) == 0
    )
    log_test("POST /api/wishlist (remove)", passed, f"Wishlist now has {len(wishlist)} items")
except Exception as e:
    log_test("POST /api/wishlist (remove)", False, f"Error: {str(e)}")

# Test 10a: POST /api/newsletter (first time)
print("\n[TEST 10a] POST /api/newsletter (first time)")
try:
    test_email = f"test-{int(time.time())}@devlearn.com"
    payload = {"email": test_email}
    response = requests.post(f"{BASE_URL}/newsletter", json=payload, timeout=10)
    data = response.json()
    passed = response.status_code == 200 and data.get("ok") == True
    log_test("POST /api/newsletter (first)", passed, f"Email: {test_email}")
except Exception as e:
    log_test("POST /api/newsletter (first)", False, f"Error: {str(e)}")

# Test 10b: POST /api/newsletter (duplicate - idempotent)
print("\n[TEST 10b] POST /api/newsletter (duplicate)")
try:
    payload = {"email": test_email}
    response = requests.post(f"{BASE_URL}/newsletter", json=payload, timeout=10)
    data = response.json()
    passed = response.status_code == 200 and data.get("ok") == True
    log_test("POST /api/newsletter (duplicate)", passed, "Idempotent upsert successful")
except Exception as e:
    log_test("POST /api/newsletter (duplicate)", False, f"Error: {str(e)}")

# Test 11a: POST /api/enroll with missing fields (400)
print("\n[TEST 11a] POST /api/enroll (missing fields)")
try:
    payload = {"userId": TEST_USER_ID}  # Missing courseSlug
    response = requests.post(f"{BASE_URL}/enroll", json=payload, timeout=10)
    data = response.json()
    passed = response.status_code == 400 and "error" in data
    log_test("POST /api/enroll (missing fields)", passed, f"Response: {data}")
except Exception as e:
    log_test("POST /api/enroll (missing fields)", False, f"Error: {str(e)}")

# Test 11b: GET /api/does-not-exist (404)
print("\n[TEST 11b] GET /api/does-not-exist (404)")
try:
    response = requests.get(f"{BASE_URL}/does-not-exist", timeout=10)
    data = response.json()
    passed = response.status_code == 404 and "error" in data
    log_test("GET /api/does-not-exist", passed, f"Response: {data}")
except Exception as e:
    log_test("GET /api/does-not-exist", False, f"Error: {str(e)}")

# Summary
print(f"\n{'='*80}")
print(f"TEST SUMMARY")
print(f"{'='*80}")
print(f"Total Tests: {tests_passed + tests_failed}")
print(f"✅ Passed: {tests_passed}")
print(f"❌ Failed: {tests_failed}")
print(f"Success Rate: {(tests_passed / (tests_passed + tests_failed) * 100):.1f}%")
print(f"{'='*80}\n")

# Detailed failures
if tests_failed > 0:
    print("\nFailed Tests Details:")
    print("-" * 80)
    for result in test_results:
        if not result["passed"]:
            print(f"❌ {result['name']}")
            if result["details"]:
                print(f"   {result['details']}")
    print()

# Exit with appropriate code
exit(0 if tests_failed == 0 else 1)
