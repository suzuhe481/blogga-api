# Blogga Backend

Blogga is a website in which users can create a share blogs. This repo is the backend-end API for Blogga. The backend repo and the live website can be accessed at the below links.

Frontend GitHub Repo: [https://github.com/suzuhe481/blogga-frontend](https://github.com/suzuhe481/blogga-frontend)

Website: [https://www.myblogga.com/](https://www.myblogga.com/)

API: https://api.myblogga.com

## Description

The Blogga backend is created with JavaScript, Node.js, Express, and uses MongoDB. This backend acts as a RESTful API server that sends information to the frontend via endpoints.

Express sessions are used to keep track of user logins, and JWTs are email to users to verify their account. Passport.js is used for user account creation.

## GET Endpoints

Here are the GET endpoints that can be tried out with this API.

https://api.myblogga.com

### Blog

- GET "/blogs"
  - Get all published blogs.
- GET "/blogs/:id"
  - Get a single blog.
- GET "/blogs/draft/:id"
  - Get a single blog.
  - Must be authorized/logged in.

### User

- GET "/users/:id"
  - Get a single user.
- GET "/users/blogs/:id"
  - Get the blogs for a single user.
- GET "/users/drafts/:id"
  - Get the drafts for a single user.
  - Must be authorized/logged in.

## Environment variables

Because of the many environment variables used, I included a section to explain some of them.

- PROD_ORIGIN_URL - The URL used in production for the main frontend website.
- DEV*ORIGIN_URL*# - The URLs used in a local development environment for the frontend website. There can be up to 4 of these variables, which are appended with a number.
- NODE_ENV - Determines how the backend is hosted. Can be "prod", "dev", or "hosted_dev".
  - "prod" - When server is hosted online, ready to be connected by a prod frontend.
  - "dev" - When the server is running locally, to be connected by a local development frontend.
  - "hosted_dev" - When the server is hosted online, and can be connected by a local development frontend.

## Releases

### Release 1.1.1

- Modified the endpoint GET "/users/:id" route which returned too much user data.

### Release 1.1.0

- New routes to allow users to delete and edit blogs, save blogs as drafts, and toggle blog visibility.

### Release 1.0.1

- Fixed settings issues that prevented user from changing their email.

### Release 1.0.0 (Initial Release)

- Basic API endpoints to create user account, get, and post blogs.
- Passport.js implementation to create user accounts.
- Emailed JWTs for user account verification.
