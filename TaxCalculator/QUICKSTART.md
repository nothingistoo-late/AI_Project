# Quick Start Guide

## Prerequisites Check

Before starting, ensure you have:
- .NET 8 SDK installed (`dotnet --version` should show 8.x)
- Node.js 18+ installed (`node --version`)
- SQL Server LocalDB or SQL Server instance

## Step 1: Backend Setup (5 minutes)

1. Open a terminal and navigate to the backend directory:
```bash
cd TaxCalculator/backend
```

2. Restore packages:
```bash
dotnet restore
```

3. Navigate to the API project:
```bash
cd TaxCalculator.API
```

4. Run the backend:
```bash
dotnet run
```

You should see:
```
Now listening on: http://localhost:5000
Swagger UI: http://localhost:5000/swagger
```

The database will be automatically created on first run with sample tax configurations (US and Vietnam).

## Step 2: Frontend Setup (3 minutes)

1. Open a **new terminal** and navigate to the frontend directory:
```bash
cd TaxCalculator/frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

You should see:
```
VITE v5.x.x  ready in xxx ms
➜  Local:   http://localhost:5174/
```

## Step 3: Test the Application

1. Open your browser and go to `http://localhost:5174`
2. You should see the Tax Calculator interface
3. Try calculating:
   - Select "United States - 2024" tax system
   - Enter a gross income (e.g., 100000)
   - Click "Calculate Tax"
   - View the detailed breakdown with charts

## Troubleshooting

### Backend Issues

**Port already in use:**
- Change the port in `TaxCalculator.API/Properties/launchSettings.json`

**Database connection error:**
- Ensure SQL Server LocalDB is installed
- Or update the connection string in `appsettings.json` to point to your SQL Server instance

**Package restore fails:**
- Check your internet connection
- Try: `dotnet nuget locals all --clear` then `dotnet restore`

### Frontend Issues

**Port already in use:**
- Vite will automatically try the next available port (5175, 5176, etc.)

**npm install fails:**
- Try: `npm cache clean --force` then `npm install`
- Ensure you're using Node.js 18+

**API connection error:**
- Ensure the backend is running on port 5000
- Check the proxy settings in `vite.config.js`

## Next Steps

- Explore the Swagger UI at `http://localhost:5000/swagger`
- Try the comparison feature to compare different tax systems
- Create custom tax configurations in the Config page
- Save calculation presets for quick access

## Docker (Optional)

If you prefer Docker:

```bash
docker-compose up -d
```

This will start:
- SQL Server container
- Backend API container
- Frontend will need to be built separately or served via the API

## Need Help?

- Check the main README.md for detailed documentation
- Review the API endpoints in Swagger UI
- Check browser console and backend logs for errors

