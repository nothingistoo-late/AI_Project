# Multi-stage build for Tax Calculator Application

# Stage 1: Build Backend
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS backend-build
WORKDIR /src
COPY backend/TaxCalculator.sln ./
COPY backend/TaxCalculator.Domain/*.csproj ./TaxCalculator.Domain/
COPY backend/TaxCalculator.Data/*.csproj ./TaxCalculator.Data/
COPY backend/TaxCalculator.Business/*.csproj ./TaxCalculator.Business/
COPY backend/TaxCalculator.API/*.csproj ./TaxCalculator.API/
RUN dotnet restore

COPY backend/ ./
WORKDIR /src/TaxCalculator.API
RUN dotnet publish -c Release -o /app/publish

# Stage 2: Build Frontend
FROM node:18-alpine AS frontend-build
WORKDIR /app
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Stage 3: Runtime
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app

# Copy backend
COPY --from=backend-build /app/publish .

# Copy frontend build
COPY --from=frontend-build /app/dist ./wwwroot

EXPOSE 80
ENTRYPOINT ["dotnet", "TaxCalculator.API.dll"]

