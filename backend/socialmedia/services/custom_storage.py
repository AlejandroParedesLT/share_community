# custom_storage.py
from django.conf import settings
from storages.backends.s3boto3 import S3Boto3Storage

class MinioMediaStorage(S3Boto3Storage):
    """
    Custom storage class for MinIO
    """
    location = 'media'
    bucket_name = settings.MINIO_BUCKET_NAME
    access_key = settings.MINIO_ACCESS_KEY
    secret_key = settings.MINIO_SECRET_KEY
    endpoint_url = f'{"https" if settings.MINIO_SECURE else "http"}://{settings.MINIO_ENDPOINT}'
    file_overwrite = False
    custom_domain = f'{settings.MINIO_ENDPOINT}/{settings.MINIO_BUCKET_NAME}'
    object_parameters = {
        'CacheControl': 'max-age=86400',
    }
    default_acl = 'public-read'