if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET tidak diatur di environment variables. Set JWT_SECRET di file .env');
}

const JWT_SECRET = process.env.JWT_SECRET;

module.exports = { JWT_SECRET };
