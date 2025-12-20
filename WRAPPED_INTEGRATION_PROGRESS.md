# Fashion Wrapped - Frontend Integration Progress

**Last Updated:** 2025-12-19
**Status:** Upload flow complete ✅ | Results page integration pending ⏳

---

## 🎯 Project Overview

Integrating the Fashion Wrapped feature into the Next.js frontend. The backend (FastAPI) is complete and running. We're connecting the frontend upload wizard and results display to the backend API.

**Backend:** `mvp-backend/python-backend/` (running at `localhost:8002`)
**Frontend:** `website/website/src/app/(wrapped)/`
**Backend Docs:** `mvp-backend/python-backend/src/apis/wrapped_dependencies/WRAPPED_PROJECT_SUMMARY.md`

---

## ✅ Completed Tasks

### 1. **Dependencies Installed**
```bash
npm install framer-motion html2canvas @supabase/supabase-js @supabase/ssr uuid @types/uuid
```

### 2. **Upload Flow** (`/wrapped` page)
**File:** `src/app/(wrapped)/wrapped/page.tsx`

- ✅ Email OTP authentication
- ✅ User profile storage (name, city) → saved to `profiles` table after OTP
- ✅ Batch ID generation (UUID) when entering upload step
- ✅ Real photo upload to backend via `POST /wrapped/upload-photo`
  - Uploads photos one-by-one with batch tracking
  - Each photo: `original_file`, `batch_id`, `total_photos_in_batch`
  - Backend processes sequentially and triggers insights generation on completion
- ✅ Simple loading state ("Uploading..." - no detailed progress to avoid user waiting)
- ✅ Error handling and validation (minimum 2 photos)

### 3. **Processing Screen** (`/wrapped?step=processing`)
- ✅ Animated checklist with Framer Motion
- ✅ Shows 3 items at a time, cycles through 9 phrases every 3 seconds
- ✅ Smooth slide-up and fade animations (top item exits, new item enters from bottom)
- ✅ User card with name and pulsing avatar
- ✅ User sees this screen indefinitely until they get email with results link

### 4. **Dev Mode for Testing**
- ✅ URL parameter support: `?step=processing`, `?step=upload`, etc.
- ✅ Allows quick UI iteration without going through full flow
- ✅ Fixed hydration errors (uses `useEffect` to read URL params after mount)

### 5. **API Wrapper**
**File:** `src/lib/api/wrapped.ts`

- ✅ `uploadPhoto()` - Upload single photo with batch tracking
- ✅ `getUserPhotos()` - Get all user photos
- ✅ `getClothingItems()` - Get extracted clothing items
- ✅ `getWrappedInsights()` - Fetch insights (ready to use, not wired up yet)
- ✅ `healthCheck()` - Backend health check

---

## 🔄 Current State

### **Upload Flow:** Fully functional
1. User enters email → OTP verification ✅
2. User enters name and city → Saved to profiles table ✅
3. User uploads 2-50 photos → Photos sent to backend ✅
4. Processing screen shows with animated checklist ✅
5. User can close page and wait for email ✅

### **Backend Processing:** Automatic
- Backend processes photos sequentially (batch locking)
- Extracts clothing items, styles, colors, embeddings
- Generates insights (celebs, city vibe, color aura, etc.)
- Sends email with shareable link containing `shareable_code`
- User clicks email link → navigates to `/wrapped/results/{shareable_code}`

### **Results Page:** Mock data only (needs wiring)
**File:** `src/app/(wrapped)/wrapped/results/[code]/page.tsx`

- ✅ Beautiful UI with flip animations (fully built)
- ✅ Mock data hardcoded
- ❌ Not connected to backend yet
- ❌ Needs to fetch insights via `GET /wrapped/insights` using shareable code

---

## 📋 Next Steps: Wire Up Results Page

### **Step 1: Clarify Field Mapping Questions**

The backend API returns insights with specific field names that differ from frontend types. Need to resolve:

#### **Question 1: User Name**
- Frontend expects: `userName`
- Backend doesn't return this in `/wrapped/insights`
- **Options:**
  - A) Fetch `first_name` from `profiles` table separately
  - B) Pass as prop from upload flow
  - C) Get from user metadata

#### **Question 2: Color Aura Description**
- Frontend expects: `color_aura_description`
- Backend returns: `color_aura` (name only, e.g., "Candlelit Dinner")
- **Options:**
  - A) Fetch description from `color_auras` table
  - B) Backend should include description in response
  - C) Use placeholder text

#### **Question 3: LLM Descriptions Mapping**
- Frontend expects: `clothing_items_description`, `style_description`
- Backend returns: `most_worn_description`, `primary_style_description`
- **Question:** Map these directly?
  - `most_worn_description` → `clothing_items_description`
  - `primary_style_description` → `style_description`

#### **Question 4: Missing Shade Hex**
- Frontend `most_worn_item` expects: `shade_hex_1`
- Backend returns: `shade` (name only, e.g., "Jet Black")
- **Question:** Is hex code available in backend response or fetch separately?

#### **Question 5: Signed URLs in Types**
- Backend includes `signed_url` for all photo references
- Frontend types use `path` instead in some places (e.g., `Pairing.garment_path`)
- **Question:** Add `signed_url` fields to frontend types and use those?

---

### **Step 2: Field Mapping Reference**

Once questions resolved, map backend → frontend:

**Direct Matches:**
```typescript
primary_style → primary_style ✅
city_vibe → city_vibe ✅
top_styles → top_styles ✅ (same structure)
top_colors → top_colors ✅ (same structure)
color_aura → color_aura ✅
```

**Rename Fields:**
```typescript
// Statistics
total_photos → total_outfits_analyzed
total_items → total_clothing_items

// Top Shades
shade_name_result → shade_name
color_result → color
shade_hex_result → shade_hex
photo_ids_result → photo_ids

// Pairings
co_occurrence_count → times_paired
garment_* fields → keep as is (add signed_url)

// Most Worn Item
wear_count → outfit_count
shade → shade_name_1
```

---

### **Step 3: Implementation Plan**

1. **Create TypeScript types** for backend API response
   - File: `src/types/wrapped.ts` (new file)
   - Mirror backend schema exactly

2. **Update results page** (`/wrapped/results/[code]/page.tsx`):
   - Get `code` param from URL
   - Fetch insights via `GET /wrapped/insights` (modify API wrapper to accept shareable_code)
   - Handle loading state (show skeleton or processing screen)
   - Handle status states:
     - `not_started` → Redirect to upload
     - `pending`/`processing` → Show processing screen (optional: poll every 10s)
     - `completed` → Transform data and display results
     - `failed` → Show error message
   - Transform backend data to match frontend types
   - Replace `mockResults` with real data

3. **Data transformation function**:
   - Create `transformBackendData(backendResponse)` helper
   - Maps all field names correctly
   - Handles missing/optional fields
   - Returns data in frontend `WrappedResults` format

4. **Update API wrapper** (`src/lib/api/wrapped.ts`):
   - Modify `getWrappedInsights()` to accept optional `shareable_code` param
   - If code provided, pass as query param or use different endpoint

---

## 📁 Important File Locations

### Frontend
```
website/website/
├── src/app/(wrapped)/
│   ├── wrapped/
│   │   └── page.tsx              # Upload wizard ✅ COMPLETE
│   └── results/[code]/
│       └── page.tsx               # Results display ⏳ NEEDS WIRING
├── src/lib/
│   ├── api/wrapped.ts             # API wrapper functions ✅
│   └── supabase/
│       ├── client.ts              # Supabase browser client ✅
│       └── server.ts              # Supabase server client
└── .env.local                     # Environment variables ✅
```

### Backend
```
mvp-backend/python-backend/
└── src/apis/
    ├── wrapped_endpoints/
    │   └── wrapped_photos.py      # Endpoints (upload, insights) ✅
    └── wrapped_dependencies/
        ├── wrapped_upload_functions.py   # Insight generation ✅
        └── WRAPPED_PROJECT_SUMMARY.md    # Complete backend docs ✅
```

---

## 🔑 Key Technical Details

### **Backend Endpoints**
- **Upload:** `POST /wrapped/upload-photo`
  - Form data: `original_file`, optional `cropped_file`
  - Query params: `batch_id` (UUID), `total_photos_in_batch` (int)
  - Auth: Bearer token (Supabase JWT)

- **Insights:** `GET /wrapped/insights`
  - Auth: Bearer token
  - Returns: Complete insights with signed URLs (1 hour expiry)
  - Status field indicates processing state

### **Batch Upload Flow**
1. Frontend generates ONE `batch_id` (UUID) per session
2. Same `batch_id` sent with ALL photos
3. Same `total_photos_in_batch` count for each call
4. Backend auto-tracks completion
5. When last photo completes → insights generation triggers
6. Email sent with `shareable_code` link

### **Supabase Tables**
- `profiles` - User profile (email, first_name, city) ✅
- `user_uploaded_photos` - Uploaded photos with processing status
- `user_clothing_pieces` - Extracted clothing items
- `user_wrapped_results` - Computed insights (includes `shareable_code`)
- `batch_uploads` - Batch tracking with locking

### **Environment Variables**
```bash
NEXT_PUBLIC_WRAPPED_SUPABASE_URL=https://wbeoevvumogmohhvlepw.supabase.co
NEXT_PUBLIC_WRAPPED_SUPABASE_ANON_KEY=eyJhbGci...
NEXT_PUBLIC_WRAPPED_BACKEND_URL=http://localhost:8002
```

---

## 🧪 Testing

### **Upload Flow**
```
http://localhost:3000/wrapped
```
1. Enter email → Get OTP
2. Enter name and city (saves to profiles)
3. Upload 2+ photos (sends to backend)
4. See processing screen
5. Check backend logs and database

### **Processing Screen (Dev Mode)**
```
http://localhost:3000/wrapped?step=processing
```
- Shows animated checklist
- Cycles through 9 phrases
- Smooth slide-up animations

### **Results Page (Mock Data)**
```
http://localhost:3000/wrapped/results/test-code
```
- Shows full UI with mock data
- Beautiful flip animations
- Not connected to backend yet

---

## 🚧 Known Issues / Notes

1. **Results page route:** Uses `[code]` param for shareable link - keep this approach
2. **Upload progress:** Intentionally simple ("Uploading...") - don't show per-photo progress
3. **Processing screen:** Shows indefinitely - user must wait for email
4. **Dev mode:** Query params work for testing (`?step=processing`)
5. **Hydration:** Fixed by using `useEffect` to read URL params (not during initial render)
6. **Animations:** Using Framer Motion for smooth slide-up carousel effect

---

## 💬 Outstanding Questions (Awaiting User Response)

Before proceeding with results page integration, need clarification on:

1. **userName** - Where to get it from?
2. **color_aura_description** - How to fetch/generate it?
3. **LLM descriptions** - Confirm mapping strategy
4. **shade_hex_1** for most_worn_item - Available in backend?
5. **signed_url** fields - Update frontend types to use these?

**Next Session:** Once questions answered, proceed with Step 2-3 of implementation plan above.

---

## 📊 Progress Summary

**Completed:** 5/10 tasks (50%)

- [x] Install dependencies
- [x] Wire up upload flow (photos → backend)
- [x] Profile storage (name, city)
- [x] Processing screen with animations
- [x] Dev mode for testing
- [ ] Resolve field mapping questions ← **CURRENT BLOCKER**
- [ ] Create TypeScript types for backend response
- [ ] Fetch insights in results page
- [ ] Transform backend data for frontend
- [ ] Replace mock data with real data

---

**Ready to continue once field mapping questions are resolved!** 🚀
