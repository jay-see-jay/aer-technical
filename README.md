
# Coding Challenge: RESTful API

## Usage

### Populate database

To ensure all data is validated, first run the script below to load all data into a SQLite database.

```shell
pnpm db:populate
```

This validates all the json files against the given schemas, creates a local SQLite database with tables for companies and employees, and loads valid data.

Any data that does not match the JSON schema is removed, but this could be improved to either clean the data or update the schema.

### Run tests

The below runs Jest, with some tests (mostly integration) for the server endpoints.

```shell
pnpm test
```

### Run server locally

```shell
pnpm serve
```

To request a single company, eg. with the ID:

```shell
curl http://localhost3000/companies/100
```

To request a list of companies:

```shell
curl http://localhost:3000/companies
```

By default, the limit is set to 25, and the offset to 0, but these values can be updated using query parameters.

```shell
curl http://localhost:3000/companies?limit=50&offset=25
```

## Brief

### Objective

Develop a RESTful API with two endpoints to manage and retrieve company data.

#### Endpoints

1.  **GET /companies**
    
    -   Returns a list of companies in JSON format.
2.  **GET /companies/{id}**
    
    -   Returns details of a single company in JSON format.

#### Data Structure

-   **Company Data:**
    
    -   `id`: Integer
    -   `name`: String
    -   `industry`: String
    -   `active`: Boolean
    -   `website`: String
    -   `telephone`: String
    -   `slogan`: String
    -   `address`: String
    -   `city`: String
    -   `country`: String
    -   `employees`: Nested array (details below)
-   **Employee Data:**
    
    -   `id`: Integer
    -   `first_name`: String
    -   `last_name`: String
    -   `email`: String (optional)
    -   `role`: String
    -   `company_id`: Integer (reference to a company)

#### Data Source

-   Data is stored in multiple JSON files. Responses could include data from any file.
-   Schemas for these files are located in the `data/schemas` folder.
-   Your solution should handle inconsistencies in data and invalid JSON files gracefully.

#### Endpoint Requirements

##### GET /companies

**Should:**

-   Return valid JSON with pagination metadata.
-   Return nested employee data if applicable.
-   Support `limit` and `offset` parameters for pagination.
-   Enable filtering by company name, active status, and employee name.

**Could:**

-   Support additional filters for future requirements.
-   Validate parameters for performance, security, and misuse prevention.

##### GET /companies/{id}

**Should:**

-   Return logically structured and valid JSON for easy client consumption.

**Could:**

-   Support returning multiple companies in one request.
-   Validate parameters for performance, security, and misuse prevention.

#### Implementation

-   Develop using Node.js.
-   Use modern JavaScript (ES6+) or TypeScript.
-   You may use frameworks or vanilla JS/TS as preferred.

### Guidelines

-   Estimated duration: 3 hours.
-   Create a public Git repository and commit your code.
-   Submit the project by emailing the repository link.
-   Be prepared to discuss your solution.

### Discussion Points

Be ready to discuss the following aspects:

-   **Testing**: Unit, Integration, End-to-End tests.
-   **Architecture**: Deployment strategies, use of tools like Terraform, CloudFormation.
-   **Authentication**: Securing the API.
-   **Security**: Defending against malicious actors.
-   **Monitoring & Alerting**: Ensuring performance and reliability.
