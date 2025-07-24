# Production stage
FROM nginx:alpine

# Copy nginx configuration for container internal use
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

# Copy built files
COPY dist/ /usr/share/nginx/html/

# Expose port 80 (nginx default)
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"] 