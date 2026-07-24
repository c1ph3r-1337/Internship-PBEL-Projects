const fs = require('fs/promises');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'db.json');

async function main() {
  const [username, email, password, displayName = username] = process.argv.slice(2);
  if (!username || !email || !password) {
    console.error('Usage: npm run add-user -- <username> <email> <password> [displayName]');
    process.exit(1);
  }

  const db = JSON.parse(await fs.readFile(DB_PATH, 'utf8'));
  const normalizedUsername = username.toLowerCase();
  const normalizedEmail = email.toLowerCase();

  if (db.users.some(user => user.username.toLowerCase() === normalizedUsername || user.email.toLowerCase() === normalizedEmail)) {
    console.error('A user with that username or email already exists.');
    process.exit(1);
  }

  db.users.push({
    id: `usr_${Date.now().toString(36)}`,
    username,
    email,
    displayName,
    password,
    createdAt: new Date().toISOString()
  });

  await fs.writeFile(DB_PATH, `${JSON.stringify(db, null, 2)}\n`);
  console.log(`Added user "${username}" to db.json.`);
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
