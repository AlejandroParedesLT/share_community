#!/bin/bash

echo "Running database migrations..."
python manage.py makemigrations
python manage.py migrate --no-input  # Ensure migrations are applied before running anything else
#python manage.py collectstatic --noinput && 
# Wait for the database to be ready before proceeding
echo "Waiting for database to be ready..."
#while ! pg_isready -h "$DATABASE_HOST" -p "$DATABASE_PORT" -U "$DATABASE_USER"; do
#    sleep 2
#done

# Check if a superuser exists, if not, create one
echo "Creating superuser..."
python manage.py shell <<EOF
import django
django.setup()
from django.contrib.auth import get_user_model

User = get_user_model()
if not User.objects.filter(username="admin").exists():
    User.objects.create_superuser("admin", "admin@example.com", "adminpassword")
    print("Superuser created successfully.")
else:
    user = User.objects.get(username="admin")
    user.set_password("adminpassword")
    user.save()
    print("Superuser already exists.")
EOF

python manage.py makemigrations socialmedia
python manage.py migrate socialmedia
python manage.py showmigrations socialmedia


echo "Starting Django server..."
exec "$@"