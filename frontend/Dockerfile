# Use a lightweight nginx image
FROM nginx:alpine

# Remove default nginx site
RUN rm -rf /usr/share/nginx/html/*

# Copy your static files into nginx HTML directory
COPY frontend/ /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# nginx default CMD is fine
