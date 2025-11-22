# Tax Calculator Application

A comprehensive full-stack tax calculation application built with .NET 8 Web API and React (Vite).

## Features

### Core Features
- **Gross to Net Conversion**: Calculate net income from gross income
- **Net to Gross Conversion**: Calculate required gross income from desired net income
- **Detailed Tax Breakdown**: View comprehensive tax calculations with bracket breakdowns
- **Insurance Contributions**: Calculate social, health, and unemployment insurance
- **Personal & Dependent Deductions**: Support for personal and dependent deductions
- **Configurable Tax Brackets**: Fully customizable progressive tax brackets
- **Additional Income Types**: Support for freelance, bonus, and other income types

### Extended Features
- **Tax Configuration UI**: Edit tax systems without code changes
- **Tax Simulation Mode**: Preview different salary scenarios
- **Calculation Presets**: Save and reuse calculation configurations
- **Multi-Currency Support**: Support for different currencies (USD, VND, etc.)
- **Multi-Language Support**: English and Vietnamese language support
- **Export Functionality**: Export results as PDF or CSV
- **Comparison Mode**: Compare tax calculations across different tax systems
- **Graphical Display**: Charts and visualizations for tax breakdowns
- **Responsive Design**: Modern, mobile-friendly UI

## Project Structure

```
TaxCalculator/
├── backend/
│   ├── TaxCalculator.API/          # Web API layer
│   ├── TaxCalculator.Business/      # Business logic layer
│   ├── TaxCalculator.Data/          # Data access layer
│   └── TaxCalculator.Domain/         # Domain entities
└── frontend/                         # React frontend
```

## Prerequisites

- .NET 8 SDK
- Node.js 18+ and npm
- SQL Server (LocalDB or full instance)
- Visual Studio 2022 or VS Code (optional)

## Backend Setup

1. Navigate to the backend directory:
```bash
cd TaxCalculator/backend
```

2. Restore NuGet packages:
```bash
dotnet restore
```

3. Update the connection string in `TaxCalculator.API/appsettings.json` if needed:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=TaxCalculatorDB;Trusted_Connection=True;MultipleActiveResultSets=true"
  }
}
```

4. Run the API:
```bash
cd TaxCalculator.API
dotnet run
```

The API will be available at `http://localhost:5000`
Swagger UI will be available at `http://localhost:5000/swagger`

## Frontend Setup

1. Navigate to the frontend directory:
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

The frontend will be available at `http://localhost:5174`

## Default Tax Systems

The application comes with two pre-configured tax systems:

### United States - 2024
- Social Security: 6.2%
- Medicare: 1.45%
- Unemployment Insurance: 0.6%
- Standard Deduction: $14,600
- Progressive tax brackets (10% to 37%)

### Vietnam - 2024
- Social Insurance: 8%
- Health Insurance: 1.5%
- Unemployment Insurance: 1%
- Personal Deduction: 11,000,000 VND
- Dependent Deduction: 4,400,000 VND per dependent
- Progressive tax brackets (5% to 35%)

## API Endpoints

### Tax Calculator
- `POST /api/TaxCalculator/calculate` - Calculate tax (gross to net or net to gross)
- `POST /api/TaxCalculator/compare` - Compare tax systems

### Tax Configuration
- `GET /api/TaxConfig` - Get all tax configurations
- `GET /api/TaxConfig/{id}` - Get tax configuration by ID
- `GET /api/TaxConfig/default` - Get default tax configuration
- `GET /api/TaxConfig/country/{countryCode}` - Get tax configurations by country
- `POST /api/TaxConfig` - Create new tax configuration
- `PUT /api/TaxConfig/{id}` - Update tax configuration
- `DELETE /api/TaxConfig/{id}` - Delete tax configuration
- `POST /api/TaxConfig/{id}/set-default` - Set as default configuration

### Presets
- `GET /api/Preset` - Get all presets
- `GET /api/Preset/{id}` - Get preset by ID
- `GET /api/Preset/config/{taxConfigId}` - Get presets by tax config ID
- `POST /api/Preset` - Create new preset
- `PUT /api/Preset/{id}` - Update preset
- `DELETE /api/Preset/{id}` - Delete preset

## Usage Examples

### Calculate Gross to Net
```json
POST /api/TaxCalculator/calculate
{
  "taxConfigId": 1,
  "income": 100000,
  "mode": "GrossToNet",
  "numberOfDependents": 2,
  "freelanceIncome": 5000,
  "bonusIncome": 10000,
  "otherIncome": 0
}
```

### Calculate Net to Gross
```json
POST /api/TaxCalculator/calculate
{
  "taxConfigId": 1,
  "income": 75000,
  "mode": "NetToGross",
  "numberOfDependents": 1
}
```

### Create Tax Configuration
```json
POST /api/TaxConfig
{
  "name": "Custom Tax System",
  "countryCode": "US",
  "currency": "USD",
  "socialInsuranceRate": 6.2,
  "healthInsuranceRate": 1.45,
  "unemploymentInsuranceRate": 0.6,
  "personalDeduction": 14600,
  "dependentDeduction": 0,
  "maxInsuranceBase": 168600,
  "isDefault": false,
  "taxBrackets": [
    {
      "minIncome": 0,
      "maxIncome": 11600,
      "rate": 10
    },
    {
      "minIncome": 11600,
      "maxIncome": null,
      "rate": 12
    }
  ]
}
```

## Technologies Used

### Backend
- .NET 8
- Entity Framework Core 8.0
- SQL Server
- Swagger/OpenAPI

### Frontend
- React 18
- Vite
- Tailwind CSS
- Recharts (for charts)
- React Router
- Axios
- i18next (for internationalization)
- jsPDF (for PDF export)

## Development

### Running Tests
```bash
# Backend tests (if implemented)
dotnet test

# Frontend tests (if implemented)
npm test
```

### Building for Production

#### Backend
```bash
cd TaxCalculator.API
dotnet publish -c Release
```

#### Frontend
```bash
cd frontend
npm run build
```

## Docker Support (Optional)

A Dockerfile can be added for containerized deployment. The application can be containerized using:
- .NET 8 runtime for the backend
- Node.js for the frontend build process
- Nginx for serving the frontend

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is provided as-is for educational and demonstration purposes.

## Support

For issues or questions, please open an issue in the repository.

