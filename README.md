# DataGrid (Three.js CSS3D + Google Sheets)

This project is a modified version of the Three.js `css3d_periodictable` demo that:

- Uses **Google Sign-In** (Image A style)
- Loads rows from a **Google Sheet**
- Renders each row as a **CSS3D tile** (Image B style)
- Colors tiles by **Net Worth**:
  - Red: **< $100K**
  - Orange: **>= $100K**
  - Green: **>= $200K**
- Supports 4 layouts: **Table / Sphere / Helix (double helix) / Grid**
- Table layout is **20 × 10**
- Grid layout is **5 × 4 × 10**

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- A Google account
- A Google Cloud Project (we'll create this)

## How to Run the Project

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure the Application

Before running, you need to configure your Google OAuth Client ID and Sheet ID in `src/config.js`. See the sections below for detailed instructions.

### 3. Start the Development Server

```bash
npm run dev
```

The application will start at `http://localhost:5173` (or another port if 5173 is busy).

### 4. Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## Step 1 — Create the Google Sheet

### 1.1 Create a New Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Click **Blank** to create a new spreadsheet
3. Name your sheet (e.g., "DataGrid People")

### 1.2 Prepare Your Data

Your sheet should have the following columns in the first row (header):

| Column Name | Description | Example |
|------------|-------------|---------|
| `Name` | Person's full name | "John Doe" |
| `Photo` | URL to profile image | "https://example.com/photo.jpg" |
| `Age` | Person's age | "30" |
| `Country` | Country code | "US", "MY", "CN" |
| `Interest` | Person's interest/hobby | "Cooking", "Writing" |
| `Net Worth` | Financial value (with $ and commas) | "$150,000.00" |

**Example CSV format:**
```csv
Name,Photo,Age,Country,Interest,Net Worth
Lee Siew Suan,https://static.kasatria.com/pivot-img/photo/019.jpg,25,CN,Writing,"$251,260.80"
New Yee Chian,https://static.kasatria.com/pivot-img/photo/020.jpg,23,CN,Cooking,"$60,393.60"
```

### 1.3 Import Your Data

- **Option A:** Copy-paste your CSV data into the sheet
- **Option B:** Use File → Import → Upload and select your CSV file

### 1.4 Share the Sheet (Required)

1. Click the **Share** button (top right)
2. Add `lisa@kasatria.com` with **Viewer** permissions
3. Click **Send**

### 1.5 Get Your Sheet ID

1. Look at your browser's address bar. The URL will look like:
   ```
   https://docs.google.com/spreadsheets/d/1ABC123xyz456DEF789ghi012jkl345mno/edit#gid=0
   ```
2. Copy the long string between `/d/` and `/edit`:
   ```
   1ABC123xyz456DEF789ghi012jkl345mno
   ```
3. This is your **SHEET_ID** — save it for later!

## Step 2 — Get Your Google OAuth Client ID

### 2.1 Create or Select a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Sign in with your Google account
3. Click the project dropdown at the top
4. Click **New Project**
   - Project name: "DataGrid" (or any name)
   - Click **Create**
5. Wait for the project to be created, then select it from the dropdown

### 2.2 Enable Google Sheets API

1. In the Google Cloud Console, go to **APIs & Services** → **Library**
2. Search for "Google Sheets API"
3. Click on **Google Sheets API**
4. Click **Enable**
5. Wait for the API to be enabled (may take a few seconds)

### 2.3 Configure OAuth Consent Screen

1. Go to **APIs & Services** → **OAuth consent screen**
2. Choose **External** (unless you have a Google Workspace account)
3. Click **Create**
4. Fill in the required fields:
   - **App name**: "DataGrid" (or any name)
   - **User support email**: Your email
   - **Developer contact information**: Your email
5. Click **Save and Continue**
6. On **Scopes** page, click **Add or Remove Scopes**
   - Search for and add: `https://www.googleapis.com/auth/spreadsheets.readonly`
   - Click **Update**, then **Save and Continue**
7. On **Test users** page (if External):
   - Click **Add Users**
   - Add your Google account email (the one you'll use to sign in)
   - Click **Add**
   - Click **Save and Continue**
8. Review and click **Back to Dashboard**

### 2.4 Create OAuth Client ID

1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth client ID**
3. If prompted, choose **Web application** as the application type
4. Fill in the form:
   - **Name**: "DataGrid Web Client" (or any name)
   - **Authorized JavaScript origins**: Click **Add URI**
     - Add: `http://localhost:5173`
     - If using a different port, use that instead (e.g., `http://localhost:5174`)
   - **Authorized redirect URIs**: Click **Add URI**
     - Add: `http://localhost:5173` (same as above)
5. Click **Create**
6. A popup will appear with your **Client ID** and **Client Secret**
   - **Copy the Client ID** (it looks like: `123456789-abc.apps.googleusercontent.com`)
   - You don't need the Client Secret for this project
7. Click **OK**

**Save your Client ID** — you'll need it in the next step!

## Step 3 — Configure the Application

### 3.1 Open the Config File

Open `src/config.js` in your code editor. It should look like this:

```javascript
export const GOOGLE_CLIENT_ID = "PASTE_YOUR_GOOGLE_OAUTH_CLIENT_ID_HERE";
export const SHEET_ID = "PASTE_YOUR_SHEET_ID_HERE";

export const SHEET_NAME = "Sheet1";
export const SHEET_RANGE = "A1:F1000";

export const PUBLISHED_CSV_URL = "";
```

### 3.2 Add Your Google Client ID

Replace `PASTE_YOUR_GOOGLE_OAUTH_CLIENT_ID_HERE` with the Client ID you copied in Step 2.4:

```javascript
export const GOOGLE_CLIENT_ID = "123456789-abcdefghijklmnop.apps.googleusercontent.com";
```

### 3.3 Add Your Sheet ID

Replace `PASTE_YOUR_SHEET_ID_HERE` with the Sheet ID you copied in Step 1.5:

```javascript
export const SHEET_ID = "1ABC123xyz456DEF789ghi012jkl345mno";
```

### 3.4 (Optional) Adjust Sheet Settings

If your sheet has a different name or you want to read a different range:

- `SHEET_NAME`: The name of the worksheet tab (default: `"Sheet1"`)
- `SHEET_RANGE`: The cell range to read (default: `"A1:F1000"`)

### 3.5 (Optional) Use Published CSV Mode

If you want to skip OAuth and use a published CSV instead:

1. In your Google Sheet, go to **File** → **Share** → **Publish to the web**
2. Choose **CSV** format
3. Click **Publish**
4. Copy the published URL (it will look like):
   ```
   https://docs.google.com/spreadsheets/d/<SHEET_ID>/gviz/tq?tqx=out:csv&sheet=Sheet1
   ```
5. Replace `<SHEET_ID>` with your actual Sheet ID
6. Paste it into `src/config.js`:
   ```javascript
   export const PUBLISHED_CSV_URL = "https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/gviz/tq?tqx=out:csv&sheet=Sheet1";
   ```

**Note:** When `PUBLISHED_CSV_URL` is set, the app will load data without requiring Google Sign-In or OAuth tokens.

### 3.6 Save and Test

1. Save `src/config.js`
2. Run `npm run dev`
3. Open `http://localhost:5173` in your browser
4. Click **Sign in with Google**
5. Select your Google account
6. Grant permissions if prompted
7. The visualization should load!

## Troubleshooting

### "Missing GOOGLE_CLIENT_ID" Error

- Make sure you've replaced the placeholder in `src/config.js` with your actual Client ID
- Check that there are no extra spaces or quotes around the Client ID

### "Access blocked" or "403: access_denied" Error

- Make sure you've added yourself as a **Test User** in the OAuth consent screen (Step 2.3)
- Wait a few minutes after adding test users for changes to propagate
- Make sure the OAuth consent screen is configured (Step 2.3)

### "Google Sheets API has not been used" or "SERVICE_DISABLED" Error

- Make sure you've **enabled Google Sheets API** in your Google Cloud project (Step 2.2)
- Wait a few minutes after enabling the API for it to propagate

### "The given origin is not allowed" Error

- Make sure you've added `http://localhost:5173` (or your port) to **Authorized JavaScript origins** (Step 2.4)
- Check that the port number matches what Vite is using (check the terminal output)

### "No data found" or Empty Visualization

- Verify your `SHEET_ID` is correct
- Check that your sheet has data in the expected format (Step 1.2)
- Verify the `SHEET_NAME` matches your worksheet tab name
- Check that the `SHEET_RANGE` includes your data

### Images Not Loading (CORS Errors)

- This is normal if images are hosted on external domains without CORS headers
- The visualization will still work, but profile pictures may not display
- To fix: Host images on a server that allows CORS, or use a proxy

### Buttons Not Clickable

- Make sure you've reloaded the page after making changes
- Check the browser console for JavaScript errors
- Try a hard refresh (Cmd+Shift+R on Mac, Ctrl+Shift+R on Windows)

### Layout Transformations Not Working

- Check the browser console for errors
- Make sure the animation loop is running (check for "Starting animation loop..." in console)
- Verify that TWEEN.js is working (check for "Started X tweens" messages)

## Project Structure

```
datagrid/
├── src/
│   ├── config.js          # Configuration (Client ID, Sheet ID)
│   ├── main.js            # Main application logic
│   ├── sheets.js          # Google Sheets data loading
│   ├── visualization.js   # Three.js CSS3D visualization
│   └── styles.css         # Application styles
├── data/
│   └── people.csv         # Sample CSV data
├── index.html             # HTML entry point
├── package.json           # Dependencies
└── README.md             # This file
```

## Features

- **4 Layout Modes:**
  - **TABLE**: 20 columns × 10 rows grid
  - **SPHERE**: Fibonacci sphere distribution
  - **HELIX**: Double helix (two intertwined strands)
  - **GRID**: 5 × 4 × 10 three-dimensional grid

- **Interactive Controls:**
  - Drag to rotate the 3D view
  - Scroll to zoom in/out
  - Click layout buttons to animate between arrangements

- **Color Coding:**
  - Red background: Net Worth < $100K
  - Orange background: Net Worth >= $100K
  - Green background: Net Worth >= $200K

## Notes

- The helix layout is implemented as a **double helix** (two intertwined strands).
- Authentication tokens are stored in localStorage, so you'll stay logged in after refreshing the page.
- The app supports both OAuth + Sheets API mode and published CSV mode (simpler, no OAuth required).

