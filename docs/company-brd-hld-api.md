# HLD — ADO #930 Concuity Query Service (Company Document)

> Source: Company-provided HLD / backend API design document. Kept verbatim (lightly formatted) for reference.

## Introduction

This project is to provide a generic query management system for the business users to edit and submit queries for approval. Once a query is approved, the automation team can send the query to this micro service for execution. This service will execute the query against one of the High Availability (HA) databases of Concuity if the HA database is not temporarily used as the primary production database, f.i. due to failover of production databases. The return type will be a list of maps, thus allowing any fields to be returned to the automation application.

This service consists of a UI component and the API implementation that supports the UI operations. For the UI design, please refer to the BRD (Business Requirements Document).

## Technology

This project will implement UI using ReactJS within the Spring Boot microservice.

This service will provide API to be called by the UI. As part of the business requirements, this service will also support third party UI applications to submit queries for approval and check the approval status. However, for security reasons, only the UI in this service will be allowed for approving purposes.

The endpoints will be secured by means of JWT token.

## Security Roles

- **User Role** — assigned to regular users to create, edit queries. This role will also allow to view the status of any submitted queries.
- **Admin Role** — assigned to PL/SQL experts to review submitted queries. The admin will be able to approve or reject submitted queries. The admin will also be able to disable/deactivate approved queries that have performance issues.
- **Execution Role** — allows the execution of queries so as to retrieve query results.

## API Design

Endpoints for the 3 security roles are kept in separate controllers. All endpoints require headers: `Bearer Token (JWT)`, `Content-Type: application/json`.

### Endpoints for User role

| Endpoint | Method | Required Params | Return Value | Description |
|---|---|---|---|---|
| `/query/new` | POST | none | Success message with Query ID or error | Create a new query |
| `/query/update` | PUT | Query ID | Success message with Query ID or error | Update a saved unapproved query |
| `/query/delete` | DELETE | Query ID | Success message with Query ID or error | Delete a saved unapproved query |
| `/queries` | GET | none | List of queries or empty collection, or error | Retrieve all queries |
| `/queries/{userId}` | GET | user ID | List of queries or empty collection, or error | Retrieve the queries submitted by this user |

### Endpoints for Admin role

| Endpoint | Method | Required Params | Return Value | Description |
|---|---|---|---|---|
| `/admin/queries` | GET | none | List of queries or empty collection, or error | Retrieve all submitted queries (ready for approval) |
| `/admin/query/approve` | PUT | Query ID | Success message with Query ID or error | Approve a submitted query |
| `/admin/query/reject` | PUT | Query ID | Success message with Query ID or error | Reject a submitted query |
| `/admin/query/disable` | PUT | Query ID | Success message with Query ID or error | Disable/deactivate an approved query |

### Endpoint for execution of queries

| Endpoint | Method | Required Params | Return Value | Description |
|---|---|---|---|---|
| `/query/execute` | GET(?) | Query ID, Query version, query-specific business parameters | `List<Map<String, Object>>` or empty collection, or error | Execute an approved query and retrieve the results |

## Third-Party UI

Third-party UI applications will be allowed to use the endpoints of the User Role. The admin endpoints can only be called by the UI of this service.

## Live Backend (observed via Swagger UI at `localhost:8095/swagger-ui`)

The actual implemented backend (`concuity-query-svc`, OAS 3.0, server `http://localhost:8095`) exposes slightly different paths than the HLD draft above:

- `GET /queries`
- `PUT /queries`
- `POST /queries`
- `DELETE /queries`
- `PUT /admin/query/{id}/reject`
- `PUT /admin/query/{id}/disable`
- `PUT /admin/query/{id}/approve`
- `GET /query/execute`
- `GET /queries/{id}`
- `GET /getAllQueryDetailsForSearch`
- `GET /admin/queries`
