# Build stage
FROM node:20-alpine AS build
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy source files and build the production bundle
COPY . .
RUN npm run build

# Run stage (Nginx web server)
FROM nginx:alpine

# Copy built files from the build stage to Nginx html directory
COPY --from=build /app/dist /usr/share/nginx/html

# Copy our custom Nginx config template for envsubst support
COPY nginx.conf.template /etc/nginx/templates/default.conf.template

# Expose HTTP port
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
