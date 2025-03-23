# Use official Python image
FROM python:3.9

# Set working directory
WORKDIR /app

# Install dependencies
RUN pip uninstall channels -y

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Ensure Gunicorn is installed
RUN pip install gunicorn daphne
# Copy the entire backend project
COPY . .

# Make entrypoint script executable
RUN chmod +x /app/entrypoint.sh

# Default command
ENTRYPOINT ["/app/entrypoint.sh"]

# # Expose port
# EXPOSE 8001
# # Run migrations and start server
# CMD ["gunicorn", "config.wsgi:application", "--bind", "0.0.0.0:8001"]

# Expose ports for HTTP and WebSocket traffic
EXPOSE 8001 8002

# Default command using Daphne instead of Gunicorn
CMD ["daphne", "-b", "0.0.0.0", "-p", "8001", "config.asgi:application", "npm"]
