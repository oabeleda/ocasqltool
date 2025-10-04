# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

OCAQueryTool is an Electron-based desktop application for querying Oracle Cloud Applications (OCA) using Oracle BI Publisher's SOAP API. It provides a SQL editor interface to run queries against OCA environments.

## Architecture

### Electron Process Architecture

**Main Process** (`public/main.js`):
- Handles IPC communication with renderer process
- Manages session state (URL, username, password)
- Interfaces with data repository layer via `src/data/repo/index.js`
- Key IPC handlers: `login`, `isConnected`, `run`, `logout`, `getConnections`

**Renderer Process** (React app):
- Communicates with main process via `preload.js` bridge exposed as `window.electronAPI`
- API functions in `src/utils/api.js` wrap IPC calls

### Data Flow

The application uses a layered architecture:

1. **Service Layer** (`src/data/service/index.js`):
   - Makes SOAP requests to Oracle BI Publisher APIs
   - Three core services: `runSqlService`, `createDataModelService`, `modelExistsService`
   - Uses base64 encoding for SQL queries
   - Connects to `/xmlpserver/services/v2/CatalogService` and `/xmlpserver/services/v2/ReportService`

2. **Repository Layer** (`src/data/repo/index.js`):
   - Wraps service calls with error handling via `resolve()` function
   - Parses XML responses and extracts data
   - Manages in-memory session object
   - Creates custom data model `/Custom/OASQLTool/OASqlTool.xdm` on first login if it doesn't exist

3. **React Components**:
   - `Main.js`: Top-level component managing login state and split-pane layout
   - `Editor.js`: CodeMirror-based SQL editor with F9 execution hotkey
   - `Login.js`: Authentication form
   - `ResultsPanel.js` / `ResultsTable.js`: Display query results
   - `getStatement.js`: Extracts SQL statement at cursor position

### Data Model Pattern

The app creates a custom BI Publisher data model (`OASqlTool.xdm`) that:
- Accepts base64-encoded SQL as a parameter
- Uses PL/SQL ref cursor to execute arbitrary queries
- Returns XML results that are parsed back into JSON

### Key Technical Details

- **XML Parsing**: Uses `xml-js` library to convert SOAP responses to JSON
- **SQL Editor**: CodeMirror with SQL syntax highlighting, F9 to execute current statement
- **Results**: Transformed via `transformResultsForRBT.js` for AG Grid display
- **Excel Export**: Implemented in `ExportExcel.js` using SheetJS
- **Session Management**: Credentials stored in-memory only (never persisted)
- **SSL**: Disables TLS verification via `NODE_TLS_REJECT_UNAUTHORIZED=0` (service layer)

## Development Commands

### Run in development mode
```bash
npm run dev
```
Starts React dev server on http://localhost:3000 and Electron window with DevTools open

### Build for production
```bash
npm run build
```
Creates production build in `build/` folder

### Package for distribution
```bash
# Windows (must run build first)
npm run package-win

# Linux (must run build first)
npm run package-linux
```

### Run tests
```bash
npm test
```

## Configuration

- Connection settings can be stored in `public/sqltool.conf` (read by `getConnections` IPC handler via `public/openConfig.js`)
- The app uses Create React App with Craco for build configuration
- Tailwind CSS (PostCSS 7 compat mode) is used for styling
