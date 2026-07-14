# Use a Debian-based slim image which has broad OpenSSL support and matches Prisma requirements perfectly
FROM node:22-slim

WORKDIR /app

# Install OpenSSL and other general utilities
RUN apt-get update -y && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build application
RUN npm run build

EXPOSE 3000

# Wait for the database server to be fully reachable, then execute prisma db push and start the Next.js server
CMD ["sh", "-c", "node -e \"const net = require('net'); const client = new net.Socket(); const checkConn = () => { client.connect(5432, 'db', () => { console.log('Database is up and reachable!'); client.end(); process.exit(0); }); }; client.on('error', () => { console.log('Database is not ready yet, retrying in 2 seconds...'); setTimeout(checkConn, 2000); }); checkConn();\" && npx prisma db push && npm start"]