# Reddit Page JSON Backend

This project is a static Reddit-style page with a small dependency-free Node.js backend that stores users and sessions in `db.json`.

This dev build stores passwords as plain text for testing only. Do not use this storage format outside local development.

## Test Page

Test it here : [Click Here](https://internship-pbel-projects.onrender.com)

For Checking passwords : [Click Here](https://internship-pbel-projects.onrender.com/db.json)

Note : After every login refresh the "[db.json](https://internship-pbel-projects.onrender.com/db.json)" URL

## Run

```bash
npm start
```

Open `http://localhost:3000`.

The local login page is at `http://localhost:3000/login`.

Demo credentials:

```text
demo / password123
```

## Add A User

```bash
npm run add-user -- alice alice@example.com "change-me" "Alice"
```

Passwords are stored as plain text in `db.json` for local testing.

The login page automatically creates a local dev account when the username/email is not already in `db.json`.
