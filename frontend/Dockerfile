# Stage 1: Build the Vite React App
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the frontend code
COPY . .

# IMPORTANT: Vite bakes environment variables into the static files at build time.
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy the Vite 'dist' folder from the builder stage to Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy our custom Nginx config for React Router
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]