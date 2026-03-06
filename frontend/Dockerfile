# Stage 1: Build the Vite React App
FROM node:22-alpine AS builder

WORKDIR /app

# Add these ARGs so Docker can receive values from the .yml file
ARG VITE_API_BASE
ARG VITE_RAZORPAY_KEY_ID
ARG VITE_SOCKET_URL

# Convert ARGs to ENV so Vite can see them during 'npm run build'
ENV VITE_API_BASE=$VITE_API_BASE
ENV VITE_RAZORPAY_KEY_ID=$VITE_RAZORPAY_KEY_ID
ENV VITE_SOCKET_URL=$VITE_SOCKET_URL

COPY package*.json ./
RUN npm install

COPY . .

# Now Vite will successfully bake these into the JS files
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine
RUN rm -rf /usr/share/nginx/html/*
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]