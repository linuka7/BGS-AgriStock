# BGS AgriStock

A full-stack agricultural inventory management system designed for fertilizer and agrochemical businesses.

BGS AgriStock replaces manual stock records with a centralized digital platform for managing products, monitoring inventory, recording stock movements, identifying low-stock items, and viewing business analytics.

## Project Overview

BGS AgriStock was created for **Balangoda Gowi Sewa**, an agricultural products business based in Balangoda, Sri Lanka.

The system helps administrators manage fertilizers, insecticides, herbicides, fungicides, and other agricultural products through a modern and responsive web application.

## Key Features

### Public Website

- Modern agricultural business landing page
- Responsive navigation
- Platform and feature overview
- Analytics showcase
- About section
- Contact section
- Administrator login access

### Secure Authentication

- Administrator login
- Password hashing with bcrypt
- JWT-based authentication
- Protected application routes
- Session and local-storage support
- Secure sign-out functionality

### Inventory Dashboard

- Total product count
- Current stock value
- Low-stock item count
- Inventory movement growth
- Inventory health indicator
- Recent activity tracking
- Low-stock product overview
- Period-based analytics

### Product Management

- Add new agricultural products
- Organize products by category
- Manage multiple product sizes
- Record invoice numbers
- Record expiry dates
- Set minimum stock levels
- Prevent duplicate category, product, and size combinations

### Stock Management

- Record sold quantities
- Automatically update available balances
- Restock existing products
- Update invoice and expiry information
- Validate available stock before sales
- Maintain stock movement history

### Stock Reports

- View complete inventory
- Search products
- Filter by category
- Filter by stock status
- View received and available quantities
- Identify low-stock and out-of-stock products

### Analytics

- Product distribution summaries
- Stock value monitoring
- Inventory movement statistics
- Category-level insights
- Recent activity visualization

## Technology Stack

### Frontend

- React
- Vite
- React Router
- Context API
- JavaScript
- HTML5
- CSS3

### Backend

- Node.js
- Express.js
- MySQL
- JSON Web Tokens
- bcrypt
- dotenv

### Development Tools

- Visual Studio Code
- PowerShell
- WAMP Server
- Git
- GitHub

## Project Structure

```text
BGS-AgriStock/
│
├── backend/
│   ├── middleware/
│   │   └── auth.js
│   ├── routes/
│   │   ├── activities.js
│   │   ├── auth.js
│   │   └── products.js
│   ├── createAdmin.js
│   ├── db.js
│   ├── index.js
│   ├── schema.sql
│   ├── seed.js
│   └── package.json
│
├── public/
│   ├── favicon.svg
│   └── icons.svg
│
├── src/
│   ├── assets/
│   ├── components/
│   │   └── home/
│   ├── context/
│   │   └── InventoryContext.jsx
│   ├── pages/
│   │   ├── AddProduct.jsx
│   │   ├── Analytics.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Home.jsx
│   │   ├── Login.jsx
│   │   ├── StockReport.jsx
│   │   └── UpdateStock.jsx
│   ├── services/
│   │   └── api.js
│   ├── utils/
│   │   └── auth.js
│   ├── App.jsx
│   └── main.jsx
│
├── .gitignore
├── index.html
├── package.json
└── vite.config.js
```

## Installation

### Prerequisites

Install the following software before running the project:

- Node.js
- npm
- MySQL or WAMP Server
- Git

### 1. Clone the repository

```bash
git clone https://github.com/linuka7/BGS-AgriStock.git
```

Move into the project directory:

```bash
cd BGS-AgriStock
```

### 2. Install frontend dependencies

```bash
npm install
```

### 3. Install backend dependencies

```bash
cd backend
npm install
```

## Database Setup

1. Start MySQL using WAMP Server or another MySQL service.
2. Open phpMyAdmin or MySQL Workbench.
3. Create a database named:

```sql
bgs_agristock
```

4. Import the following file:

```text
backend/schema.sql
```

5. Optionally run the seed script to insert sample data:

```bash
node seed.js
```

## Environment Configuration

Environment files are excluded from GitHub for security.

### Backend environment file

Create:

```text
backend/.env
```

Add:

```env
PORT=5000

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=bgs_agristock

JWT_SECRET=replace_with_a_long_secure_random_secret

ADMIN_NAME=Administrator
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=replace_with_a_secure_password
```

Never commit real passwords or secret keys to GitHub.

### Frontend environment file

Create a `.env` file in the project root:

```env
VITE_API_URL=http://localhost:5000/api
```

## Create the Administrator Account

From the backend directory, run:

```bash
node createAdmin.js
```

The administrator details are taken from the variables inside `backend/.env`.

## Running the Application

Two terminal windows are required.

### Start the backend

```bash
cd backend
node index.js
```

The backend runs at:

```text
http://localhost:5000
```

### Start the frontend

From the main project directory:

```bash
npm run dev
```

The frontend normally runs at:

```text
http://localhost:5173
```

## Application Routes

```text
/                 Public landing page
/login            Administrator login
/dashboard        Inventory dashboard
/update-stock     Record product sales
/stock-report     View and filter inventory
/add-product      Add new products
/analytics        View inventory analytics
```

Protected routes require a valid administrator login.

## API Overview

```text
POST   /api/auth/login
GET    /api/products
POST   /api/products
PATCH  /api/products/:id/sell
PATCH  /api/products/:id/restock
GET    /api/activities
```

Protected API endpoints require a JWT bearer token.

## Screenshots

Project screenshots will be added for:

- Landing page
- Administrator login
- Inventory dashboard
- Update stock page
- Stock report
- Add product page
- Analytics page

## Security

- Passwords are hashed before database storage.
- Authentication is handled using JSON Web Tokens.
- Protected frontend routes require a valid session.
- Protected backend routes require a valid bearer token.
- Environment variables and credentials are excluded through `.gitignore`.
- Duplicate products are restricted at the database level.

## Future Improvements

- Multiple administrator and employee accounts
- Role-based permissions
- Supplier management
- Sales invoice generation
- Product barcode scanning
- Email and SMS low-stock notifications
- Data export to PDF and Excel
- Cloud deployment
- Automated database backups
- Mobile application support

## Project Status

The core full-stack application is complete and operational in the local development environment.

Current development status:

- Public landing page complete
- Authentication complete
- Product management complete
- Sales recording complete
- Product restocking complete
- Stock reporting complete
- Analytics complete
- MySQL integration complete
- GitHub repository configured

## Author

**Linuka Bandara**

Higher Diploma in Computing and Software Engineering  
Software Engineering Student

GitHub:

```text
https://github.com/linuka7
```

## Repository

```text
https://github.com/linuka7/BGS-AgriStock
```

## Notice

This project was developed as an educational, portfolio, and real-business inventory management solution.