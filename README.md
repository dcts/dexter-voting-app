
# DEXTER Web Application

## Introduction
DEXTER is a dynamic web application built using the Next.js framework and TypeScript. It's designed for modern web experiences, offering a blend of server-side rendering and static page generation capabilities.

## Features
- **Customizable Layouts:** With components such as `Header.tsx`, `Footer.tsx`, and `layout.tsx`, the application offers a highly customizable layout for various pages.
- **Static Assets Management:** The `public/` directory contains images and icons used across the application, including a dedicated `contimg/` directory for content images.
- **Styling with Tailwind CSS:** The application utilizes Tailwind CSS for styling, as seen in `tailwind.config.js` and `globals.css`, allowing for rapid UI development with utility-first CSS.
- **Environment Configuration:** Environment variables can be managed through `.env` and `sample.env` files, facilitating the configuration of different environments without altering the codebase.
- **Database Integration:** A SQL file (`dbibpvelmuqrvu.sql`) suggests integration with a SQL database, outlining the schema and possibly seed data for local development or testing.
- **Security and Best Practices:** The inclusion of `.eslintrc.json` and `.prettierrc` files indicates a commitment to code quality and consistency, leveraging ESLint and Prettier for code analysis and formatting.

## Setup and Installation
1. **Prerequisites:**
   - Node.js (version specified in `package.json` "engines" field)
   - A SQL database server
2. **Installation:**
   - Clone the repository to your local machine.
   - Run `npm install` to install the dependencies.
3. **Database Setup:**
   - Create a database and import the `dbibpvelmuqrvu.sql` file.
   - Configure your database connection details in the `.env` file.
4. **Running the Application:**
   - Use `npm run dev` to start the development server.
   - Access the application at `http://localhost:3781`.

## Pages and Routing
- **Home Page (`index.tsx`):** The main entry point of the application.
- **404 Page (`404.tsx`):** Custom 404 error page.
- Additional pages under the `pages/` directory, structured according to Next.js routing conventions.

## Contributing
- Contributions to DEXTER are welcome! Please refer to the contribution guidelines for how to propose changes or report issues.

## License
- The application is licensed under [INSERT LICENSE HERE], allowing for specified uses and contributions.

Environment config in 'sample.env', reanme this to '.env' after you insert needed credentials:
(do not remove the ":" in the WEB_PORT just change the port value as needed)

DB_HOST=
DB_USER=
DB_PASS=
DB_NAME=
NEXT_PUBLIC_WS_PORT=3992
NEXT_PUBLIC_WEB_PORT=:3781
NEXT_PUBLIC_SITE_DOMAIN=http://

Development:

````bash
npm run dev

Build with:
```bash
npm run build

Prettier:
```bash
npm run prettier

Open [http://http://localhost:3781](http://http://localhost:3781) with your browser to see the result.


````
