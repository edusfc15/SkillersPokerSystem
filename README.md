# SkillersPokerSystem

SkillersPokerSystem is a web application for managing poker club operations, including player management, game tracking, rake calculation, and user authentication. Built with ASP.NET Core, Entity Framework Core, and Angular.

## Features
- User authentication and role management (Admin, RegisteredUser)
- Player registration and management
- Game and game detail tracking (rebuy, cash out, chips, tips)
- Rake and rake detail management
- RESTful API controllers for core entities
- Angular SPA frontend (served from `ClientApp`)
- Database seeding for initial data (users, players, games, rake)
- JWT-based authentication

## Technologies Used
- ASP.NET Core
- Entity Framework Core (SQL Server)
- ASP.NET Identity
- Angular (frontend, in `ClientApp`)
- MiniProfiler (performance profiling)

## Getting Started

### Prerequisites
- .NET 5 SDK or later
- Node.js & npm (for Angular frontend)
- SQL Server instance

### Setup
1. **Clone the repository**
   ```sh
   git clone <repo-url>
   cd SkillersPokerSystem
   ```
2. **Configure the database**
   - Update `appsettings.json` with your SQL Server connection string under `DefaultConnection`.
3. **Restore .NET dependencies**
   ```sh
   dotnet restore SkillersPokerSystem/SkillersPokerSystem.csproj
   ```
4. **Install Angular dependencies**
   ```sh
   cd SkillersPokerSystem/ClientApp
   npm install
   ```
5. **Apply database migrations and seed data**
   - The database will be created and seeded automatically on first run.

6. **Run the application**
   ```sh
   dotnet run --project SkillersPokerSystem/SkillersPokerSystem.csproj
   ```
   - The Angular frontend will be served automatically in development mode.


## Project Structure
- `Controllers/` - API controllers for users, games, players, etc.
- `Data/` - Entity models, DbContext, seeders, helpers
- `ViewModels/` - View models for API responses
- `ClientApp/` - Angular SPA frontend
- `wwwroot/ImportFiles/` - CSV files for initial data import (games, players)

## Development
- To run the backend and frontend together, use `dotnet watch run` in the project root.
- Angular CLI is used for frontend development (`npm start` in `ClientApp`).

## License
This project is for educational and club management purposes. See LICENSE for details.
