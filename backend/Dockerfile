FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

# Install production dependencies
RUN npm ci --omit=dev --ignore-scripts

# Copy application files
COPY . .

# Generate Prisma client for Wasm/Edge and Postgres adapter
RUN npx prisma generate --schema=prisma/schema.prisma

EXPOSE 5001

CMD ["node", "src/server.js"]
