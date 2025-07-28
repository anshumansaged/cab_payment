# MVLT (Maa Vaibhav Laxami Transport) Cab Payment & Cash Management

Live App: [https://anshumansaged.github.io/](https://anshumansaged.github.io/)

## Overview
This project is a modern, branded cab fleet management dashboard for MVLT (Maa Vaibhav Laxami Transport). It automates trip payment calculations, cash management, and data saving to Google Sheets via SheetDB. The UI is inspired by AntStack, with glassmorphism, gradients, and a professional, mobile-friendly design.

## Features
- **Trip Payment Calculation**: Calculates driver pay, owner profit, commissions, and cash collection for each trip.
- **Batch Cash Entry**: Accountant can enter multiple cash transactions at once.
- **Google Sheets Integration**: All data is saved and fetched via SheetDB API.
- **Modern UI/UX**: Responsive, glassmorphic, and visually appealing.
- **Report Caching**: Reduces API calls by caching daily reports in local storage.
- **API Quota Management**: Prevents excessive SheetDB usage with local quota tracking.

## Calculation Logic
### 1. **Trip Earnings**
- User enters earnings for each app (Uber, Indrive, Yatri, Rapido, Offline).
- **Total Earnings** = Sum of all entered earnings.

### 2. **Commissions**
- **Uber Commission**: If enabled, a fixed ₹117 is deducted.
- **Yatri Commission**: ₹10 per Yatri Sathi trip (user enters number of trips).
- **Total Earnings After Commission** = Total Earnings - Uber Commission - Yatri Commission

### 3. **Driver Pay & Owner Profit**
- **Vikash Yadav**:
  - Driver Pay = (Total Earnings After Commission - Total Fuel) / 2
  - Owner Profit = Driver Pay
- **Other Drivers**:
  - Driver Pay = Total Earnings After Commission × Driver's Percent (e.g., 30%, 35%)
  - Owner Profit = Total Earnings After Commission - Total Fuel - Total Other Expenses - Driver Pay

### 4. **Cash Collection**
- **Vikash Yadav**:
  - Cash = (Uber + Indrive + Yatri + Rapido + Offline) - Total Fuel - Online Payment + Uber Commission
- **Other Drivers**:
  - Cash = (Uber + Indrive + Yatri + Rapido + Offline) - Total Fuel - Online Payment - Driver Pay

### 5. **Other Calculations**
- **Fuel/CNG/Petrol**: User can add multiple fuel entries; total is deducted from earnings/cash.
- **Other Expenses**: User can add multiple labeled expenses; total is deducted from owner profit.
- **Driver Withdrawal**: If driver is paid in advance, amount is deducted from driver pay and cash.
- **Cash Given to Accountant**: Deducted from remaining cash.

### 6. **API Quota**
- **Save Quota**: Max 100 saves/month (tracked in local storage).
- **Report Quota**: Max 350 report fetches/month (tracked in local storage).

### 7. **Report Caching**
- Daily report data is cached in local storage to minimize API calls.

## Technologies Used
- **React 18+**
- **SheetDB API** (for Google Sheets integration)
- **Tailwind-inspired CSS** (custom, not Tailwind itself)
- **Glassmorphism, Gradients, SVG backgrounds**
- **GitHub Actions** for CI/CD deployment to GitHub Pages

## How to Use
1. **Trip Payment**: Fill in trip details, earnings, cash, fuel, and expenses. Click "Calculate Payment" to see the summary. Save to Google Sheet or send to WhatsApp.
2. **Cash Manager**: Accountants can batch enter cash transactions for multiple drivers.
3. **Reports**: View daily/monthly reports, with data cached for performance.

## Data Flow
- All trip and cash data is POSTed to SheetDB, which syncs with a Google Sheet.
- Reports are fetched from SheetDB and displayed in the dashboard.

## SheetDB API
- The SheetDB API URL is hardcoded for simplicity: `https://sheetdb.io/api/v1/hbm0l5jjta0ls`
- Data columns: `type`, `driver`, `amount`, `date`, `accountant_type`, `note`, etc.

## Deployment
- Automated via GitHub Actions to [https://anshumansaged.github.io/](https://anshumansaged.github.io/)
- Push to `main` branch triggers deployment.

## Security Note
- The SheetDB API URL is public in the frontend. For sensitive use, consider backend proxying or environment variables.

## Credits
- UI/UX inspired by AntStack and modern SaaS dashboards.
- Developed for MVLT (Maa Vaibhav Laxami Transport).

---
For any issues or feature requests, please open an issue on the [GitHub repo](https://github.com/anshumansaged/cab_payment).
