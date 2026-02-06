DataGrid

Three.js CSS3D + Google Sheets Visualization

DataGrid is a modified implementation of the Three.js css3d_periodictable example.
It visualizes rows from a Google Sheet as interactive CSS3D tiles and supports multiple 3D layouts.

This project was built as a preliminary technical assignment to demonstrate frontend development, data integration, and 3D visualization skills.

Key Features

    Google Sign-In (OAuth 2.0) for authentication

    Live data loading from Google Sheets

    Each row rendered as a CSS3D tile

    Tile background color based on Net Worth

    Red: < $100K

    Orange: ≥ $100K

    Green: ≥ $200K

  Layout Modes

    Table (20 × 10)

    Sphere

    Double Helix

    Grid (5 × 4 × 10)

Tech Stack

    JavaScript (ES6)

    Three.js (CSS3DRenderer)

    Google Sheets API

    Google OAuth 2.0

    Vite (development & build)

Project Structure
       
    datagrid/
    ├── src/
    │   ├── config.js          # Google OAuth & Sheet configuration
    │   ├── main.js            # App entry & layout controls
    │   ├── sheets.js          # Google Sheets data loader
    │   ├── visualization.js   # CSS3D visualization & layouts
    │   └── styles.css         # UI styles
    ├── data/
    │   └── people.csv         # Sample data
    ├── index.html
    ├── package.json
    └── README.md

Setup & Run
1. Install Dependencies

       npm install

2. Configure Google Credentials
   Update src/config.js:

        export const GOOGLE_CLIENT_ID = "YOUR_GOOGLE_OAUTH_CLIENT_ID";
       export const SHEET_ID = "YOUR_GOOGLE_SHEET_ID";
       export const SHEET_NAME = "Sheet1";
       export const SHEET_RANGE = "A1:F1000";

3. Start Development Server

       npm run dev


Open:
           
    http://localhost:5173






