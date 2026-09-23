# Desi Nuts Backend (ASP.NET Core Web API)

This is the backend for the Desi Nuts website. It is a simple ASP.NET Core
Web API project that also serves the existing `frontend` folder as the
website, so everything runs from one server — no separate frontend server
or CORS setup needed.

## What it does

- **Products** (`/api/products`) — the shop page loads product names, images
  and prices (by weight) from the database instead of hardcoded JavaScript.
- **Orders** (`/api/orders`) — placing an order from the cart saves it to the
  database, then opens WhatsApp so the customer can confirm the order.
- **Contact Us** (`/api/contact`) — messages from the contact form are saved
  to the database.
- **Login / Register** (`/api/auth/...`) — simple account system using
  session cookies (see `login.html` / `register.html`).

## Requirements

- .NET SDK (10.0 or later)
- SQL Server LocalDB (comes with Visual Studio / SQL Server Express tools)

## How to run it

```
cd backend/DesiNuts.Api
dotnet ef database update   # creates the DesiNutsDb database (only needed once)
dotnet run
```

Then open the URL shown in the terminal (e.g. `http://localhost:5130`) —
that's the whole website with the backend running behind it.

## Project structure

```
DesiNuts.Api/
├── Controllers/     API endpoints (Products, Orders, Contact, Auth)
├── Models/          Database tables (Product, Order, User, ...) and request DTOs
├── Data/            AppDbContext (EF Core) and the password hasher
├── Migrations/      EF Core database migrations
└── Program.cs       App startup / configuration
```

## Changing the database connection

The connection string is in `DesiNuts.Api/appsettings.json` under
`ConnectionStrings:DefaultConnection`. It points at LocalDB by default:

```
Server=(localdb)\mssqllocaldb;Database=DesiNutsDb;Trusted_Connection=True;MultipleActiveResultSets=true
```

If your database changes (new tables/columns in the `Models` folder), run:

```
dotnet ef migrations add <SomeName>
dotnet ef database update
```
