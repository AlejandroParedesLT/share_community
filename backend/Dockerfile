# Use official Python image
FROM python:3.9

# Set working directory
WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
# Ensure Gunicorn is installed
RUN pip install gunicorn
# Copy the entire backend project
COPY . .

# Make entrypoint script executable
RUN chmod +x /app/entrypoint.sh

# Default command
ENTRYPOINT ["/app/entrypoint.sh"]

# Expose port
EXPOSE 8001
# Run migrations and start server
CMD ["gunicorn", "config.wsgi:application", "--bind", "0.0.0.0:8001"]
