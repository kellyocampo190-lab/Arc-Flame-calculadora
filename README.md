# Arc & Flame Costing and Quotation Platform

A web-based costing and quotation management platform developed for Arc & Flame Silver Jewellery.

The platform helps the business owner calculate production costs, estimate selling prices, manage material prices and prepare customer quotations from one central system.

## Project Purpose

Arc & Flame Silver Jewellery is independently managed by its owner, who is responsible for designing and producing jewellery, purchasing materials, calculating prices, preparing quotations, communicating with customers and managing the business.

The purpose of this project is to simplify the costing and quotation process, reduce pricing errors and provide an organised record of previous calculations and quotations.

This project was developed for academic purposes as part of a university software engineering project.

## Main Features

### Authentication

- Secure login
- Protected platform routes
- User session management
- Sign-out functionality

### Material Management

- Register materials
- Record material prices
- Define the measurement unit
- Update material information
- Activate or deactivate materials
- Use active materials in cost calculations

### Cost Calculator

- Select previously registered materials
- Enter the quantity of each material
- Calculate the total material cost
- Calculate labour based on hours and hourly rate
- Add packaging costs
- Add delivery costs
- Add other production expenses
- Apply a profit margin
- Estimate the final selling price

### Sales Channel Costs

The calculator supports different types of sales channels:

- Direct sales
- Own website
- Online marketplace
- Physical display
- Market or event
- Other sales channels

Depending on the selected channel, the calculation may include:

- Percentage fees
- Fixed fees per sale
- Recurring costs
- Expected number of sales
- Allocated recurring costs

### Calculation History

- Save completed calculations
- View previous calculations
- Review the complete cost breakdown
- Access the materials used in each calculation
- View the recommended selling price and estimated profit

### Quotation Management

- Create a quotation from a saved calculation
- Add customer information
- Add a jewellery description
- Include deposit requirements
- Define an estimated production time
- Set a quotation expiry date
- Add payment conditions
- Add one-off materials or expenses for customised jewellery
- Save and review previous quotations
- Download quotations as PDF files

## One-Off Custom Costs

Personalised jewellery may require materials that are not normally kept in stock, such as a specific stone requested by a customer.

The quotation module allows the owner to add temporary materials and additional costs without registering them in the permanent material catalogue. These costs apply only to the selected quotation.

## Technologies Used

- Next.js
- React
- TypeScript
- Tailwind CSS
- Supabase
- PostgreSQL
- Supabase Authentication
- React PDF
- Git
- GitHub
- Netlify

## Technical Architecture

The platform follows a web-based client-server architecture:

- **Presentation layer:** Next.js, React and Tailwind CSS
- **Application layer:** Next.js server actions and calculation logic
- **Data layer:** Supabase and PostgreSQL
- **Authentication:** Supabase Authentication
- **Deployment:** Netlify
- **Version control:** Git and GitHub

## Data Model

The main data entities are:

- Users
- Materials
- Calculations
- Calculation materials
- Quotations
- Quotation custom costs

Each calculation and quotation is associated with the authenticated user. Row Level Security policies are used to restrict access to the corresponding records.

## Project Methodology

The project was managed using a Kanban methodology.

The project board was organised into the following stages:

- Backlog
- To Do
- In Progress
- Testing
- Done

User stories and development tasks were moved through these stages according to their progress.


