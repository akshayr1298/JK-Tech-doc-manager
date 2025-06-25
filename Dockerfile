# Stage 1: Build the NestJS application
FROM node:23-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm install  

COPY . .

# Generate Prisma Client - This step is crucial AFTER node_modules are in place
RUN npx prisma generate

# Build the NestJS application for production
RUN npm run build

# Stage 2: Create a lighter production image
FROM node:23-alpine

WORKDIR /app

RUN npm install -g pm2

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

RUN npm install --omit=dev

# --- MODIFICATION START ---
# Copy your single .env file into the production image
COPY .env ./.env
# --- MODIFICATION END ---


RUN mkdir -p uploads

EXPOSE 4000

ENV NODE_ENV production

CMD ["pm2-runtime", "start", "ecosystem.config.js", "--env", "production"]
