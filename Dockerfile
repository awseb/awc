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

# Automatically run prisma db push on container start to sync database schema before launching web app
CMD ["sh", "-c", "npx prisma db push && npm start"]