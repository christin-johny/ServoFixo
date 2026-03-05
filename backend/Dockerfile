# Stage 1: Build Stage
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including devDependencies for TypeScript)
RUN npm install

# Copy the rest of the backend source code
COPY . .

# Compile TypeScript to JavaScript (creates the /dist folder)
RUN npm run build

# Stage 2: Production Stage
FROM node:22-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ONLY production dependencies (makes the container smaller and faster)
RUN npm install --omit=dev

# Copy the compiled output from the builder stage
COPY --from=builder /app/dist ./dist

# Expose the port your app runs on
EXPOSE 5000

# Start the application using your package.json script
CMD ["npm", "start"]