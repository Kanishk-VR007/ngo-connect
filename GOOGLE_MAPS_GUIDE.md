# 🗺️ Google Maps Integration Guide

## ✅ What's Been Added

### 1. Sample Data ✅
**Database seeded with:**
- 8 NGOs across major US cities (New York, LA, Chicago, Houston, Phoenix, Philadelphia, San Antonio, San Diego)
- 3 test users + 1 admin user
- 12 service requests (various statuses)
- 20 donations (completed)

### 2. Google Maps Component ✅
- Interactive Google Maps with NGO markers
- Custom info windows with NGO details
- Click-to-view-details functionality
- Auto-fitting bounds to show all NGOs
- Custom marker icons

### 3. NGO List Page Updates ✅
- **List View / Map View Toggle** - Switch between list and map views
- **Geolocation Support** - Auto-detect user location
- **Distance Filter** - Find NGOs within 5km, 10km, 25km, 50km, 100km
- **Search & Category Filters** - Enhanced filtering options
- **NGO Statistics Cards** - Shows projects, people helped, volunteers
- **Real-time Results Count** - Display number of NGOs found

---

## 🔑 Google Maps API Key Setup

The app currently uses a placeholder API key. To enable full Google Maps functionality:

### Step 1: Get Your API Key
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable **Maps JavaScript API**
4. Create credentials → API Key
5. Restrict the key (optional but recommended):
   - Application restrictions: HTTP referrers
   - Add: `http://localhost:3000/*`
   - API restrictions: Maps JavaScript API

### Step 2: Update the Application
Open `client/public/index.html` and replace:
```html
<script src="https://maps.googleapis.com/maps/api/js?key=YOUR_GOOGLE_MAPS_API_KEY&libraries=places"></script>
```

With:
```html
<script src="https://maps.googleapis.com/maps/api/js?key=YOUR_ACTUAL_API_KEY&libraries=places"></script>
```

---

## 🎯 Features Available

### Map View Features
✅ **NGO Markers** - All NGOs displayed as red pins
✅ **Info Windows** - Click markers to see NGO details
✅ **Auto-zoom** - Map automatically fits to show all NGOs
✅ **Responsive** - Works on mobile and desktop

### List View Features
✅ **NGO Cards** - Detailed cards with stats
✅ **Quick Navigation** - View Details button
✅ **Category Badges** - Visual category indicators
✅ **Rating Display** - Star ratings shown

### Filtering System
✅ **Search** - Search by NGO name
✅ **Category** - Filter by service type
✅ **Distance** - Find nearby NGOs (requires geolocation)
✅ **Real-time** - Results update as you type

---

## 📍 Sample NGO Locations

| NGO Name | City | Coordinates | Services |
|----------|------|-------------|----------|
| Hope Foundation | New York, NY | 40.7128, -74.0060 | Education, Healthcare |
| Green Earth Foundation | Los Angeles, CA | 34.0522, -118.2437 | Environmental |
| Health First NGO | Chicago, IL | 41.8781, -87.6298 | Healthcare |
| Education For All | Houston, TX | 29.7604, -95.3698 | Education, Skills |
| Food Relief Network | Phoenix, AZ | 33.4484, -112.0740 | Food & Nutrition |
| Women Empowerment Center | Philadelphia, PA | 39.9526, -75.1652 | Women Empowerment |
| Child Care Foundation | San Antonio, TX | 29.4241, -98.4936 | Child Welfare |
| Disaster Relief Corps | San Diego, CA | 32.7157, -117.1611 | Disaster Relief |

---

## 🧪 Testing the Application

### 1. Login to Test Account
```
Email: john.doe@example.com
Password: password123
```

### 2. Navigate to NGO List
- Click "Find NGOs" in navigation
- You should see 8 NGOs in list view

### 3. Switch to Map View
- Click "🗺️ Map View" button
- Map will load (with placeholder if no API key)
- See all 8 NGO markers

### 4. Test Filters
- **Search**: Type "Hope" to find Hope Foundation
- **Category**: Select "Healthcare" to filter
- **Distance**: Enable location and select "Within 50 km"

### 5. Click NGO Markers
- Click any red marker on map
- Info window appears with NGO details
- Click "View Details" to go to NGO page

---

## 💡 Usage Tips

### For Users
1. **Allow Location Access** - For distance-based filtering
2. **Use Map View** - To see NGOs geographically
3. **Click Markers** - Quick preview before visiting page
4. **Combine Filters** - Search + Category + Distance for precise results

### For Developers
1. **Custom Markers** - Modify icon in `GoogleMap.js`
2. **Marker Clustering** - Add for large datasets
3. **Directions** - Integrate Google Directions API
4. **Street View** - Add panorama views

---

## 🔧 Customization Options

### Change Map Style
Edit `GoogleMap.js`, line 21-26:
```javascript
styles: [
  {
    featureType: 'poi',
    elementType: 'labels',
    stylers: [{ visibility: 'off' }]
  }
]
```

### Change Marker Color
Edit `GoogleMap.js`, line 48:
```javascript
icon: {
  url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png', // Change color
  scaledSize: new window.google.maps.Size(40, 40)
}
```

Available colors: red, blue, green, yellow, purple, orange

### Adjust Default Zoom
Edit `GoogleMap.js`, line 19:
```javascript
zoom: 12, // Change this number (1-20)
```

---

## 📊 API Endpoints Used

### Get All NGOs
```
GET /api/ngos
Query params: ?category=Healthcare&search=Hope
```

### Get Nearby NGOs
```
GET /api/ngos/nearby?lat=40.7128&lng=-74.0060&distance=50000
```

---

## 🐛 Troubleshooting

### Map Not Showing
- **Check API Key**: Ensure it's valid and unrestricted
- **Check Console**: Look for JavaScript errors
- **Check Network**: Verify Google Maps script loads

### Markers Not Appearing
- **Check Data**: Verify NGOs have valid coordinates
- **Check Console**: Look for coordinate errors
- **Check Zoom**: Map might be too zoomed out

### Geolocation Not Working
- **HTTPS Required**: Geolocation requires HTTPS (localhost works)
- **User Permission**: Browser must allow location access
- **Check Browser**: Some browsers block geolocation

### Distance Filter Not Working
- **Enable Location**: Must allow geolocation first
- **Check Backend**: Ensure `/api/ngos/nearby` endpoint works
- **Check Units**: Distance is in meters (multiply km by 1000)

---

## 🚀 Next Steps

### Recommended Enhancements
1. **Marker Clustering** - For better performance with many NGOs
2. **Custom Info Windows** - More detailed NGO previews
3. **Directions Integration** - Get directions to NGO
4. **Heatmap Layer** - Show NGO density
5. **Street View** - Preview NGO location
6. **Mobile Optimization** - Improve touch interactions

### Advanced Features
1. **Real-time Tracking** - Live NGO location updates
2. **Geofencing** - Notifications when near NGOs
3. **Route Planning** - Multi-NGO visit planning
4. **Analytics** - Track which NGOs are viewed most
5. **Export Map** - Save/share map views

---

## 📝 Code Files Modified

1. `client/public/index.html` - Added Google Maps script
2. `client/src/components/GoogleMap.js` - NEW: Map component
3. `client/src/components/GoogleMap.css` - NEW: Map styling
4. `client/src/pages/NGOList.js` - Added map view toggle
5. `client/src/pages/NGOList.css` - Enhanced styling
6. `seed.js` - NEW: Database seeding script

---

## ✅ Summary

Your NGO Connect App now has:
- ✅ 8 sample NGOs with real coordinates
- ✅ Interactive Google Maps integration
- ✅ List/Map view toggle
- ✅ Distance-based filtering
- ✅ Clickable markers with info windows
- ✅ User geolocation support
- ✅ Enhanced search and filtering

**Ready to use!** Just add your Google Maps API key for full functionality.

---

*Last Updated: February 10, 2026*
