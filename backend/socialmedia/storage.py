from django.conf import settings
from storages.backends.s3boto3 import S3Boto3Storage
import boto3
from botocore.client import Config

class StaticS3Boto3Storage(S3Boto3Storage):
    location = settings.STATICFILES_LOCATION
    
class S3MediaStorage(S3Boto3Storage):
    location = 'media'
    file_overwrite = False
    
def get_s3_client():
    """Return a boto3 client configured for MinIO"""
    return boto3.client(
        's3',
        endpoint_url=settings.AWS_S3_ENDPOINT_URL,
        aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
        config=Config(signature_version='s3v4'),
        region_name='us-east-1'  # MinIO requires a region, but any value works
    )
    
def ensure_bucket_exists():
    """Ensure the bucket exists, creating it if needed"""
    s3 = get_s3_client()
    try:
        s3.head_bucket(Bucket=settings.AWS_STORAGE_BUCKET_NAME)
    except:
        s3.create_bucket(Bucket=settings.AWS_STORAGE_BUCKET_NAME)