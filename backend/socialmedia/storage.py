from django.conf import settings
from storages.backends.s3boto3 import S3Boto3Storage
import boto3
from botocore.client import Config
from botocore.exceptions import ClientError

class StaticS3Boto3Storage(S3Boto3Storage):
    location = settings.STATICFILES_LOCATION

class S3MediaStorage(S3Boto3Storage):
    bucket_name = settings.AWS_STORAGE_BUCKET_NAME
    location = ''
    file_overwrite = False
    #custom_domain = settings.AWS_S3_DOMAIN_RETRIEVAL
    def url(self, name, parameters=None, expire=None):
        """Override the URL method to return a properly formatted URL without protocol duplication"""
        # Use a direct, hardcoded URL for now to fix the immediate issue
        return f'{settings.MINIO_ACCESS_URL}/{name}'#f"http://localhost:9000/{self.bucket_name}/{name}"
    

def get_s3_client():
    """Return a boto3 client configured for MinIO"""
    return boto3.client(
        's3',
        endpoint_url=settings.AWS_S3_ENDPOINT_URL,  # http://localhost:9000
        aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
        config=Config(signature_version='s3v4'),
        region_name="us-east-1"  # MinIO does not require a region
    )

def get_custom_s3_client():
    return boto3.client(
        's3',
        endpoint_url=settings.CUSTOM_MINIO_URL_TARGET,
        aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
        config=Config(signature_version='s3v4'),
        region_name="us-east-1"  # MinIO does not require a region
    )

def ensure_bucket_exists():
    """Ensure the MinIO bucket exists, creating it if needed"""
    s3 = get_s3_client()
    bucket_name = settings.AWS_STORAGE_BUCKET_NAME

    try:
        s3.head_bucket(Bucket=bucket_name)
    except ClientError as e:
        error_code = e.response['Error']['Code']
        if error_code == '404':
            print(f"Bucket '{bucket_name}' not found. Creating...")
            s3.create_bucket(Bucket=bucket_name)
            s3.put_bucket_policy(
                Bucket=bucket_name,
                Policy='{"Version": "2012-10-17", "Statement": [{"Effect": "Allow", "Principal": "*", "Action": "s3:GetObject", "Resource": "arn:aws:s3:::' + bucket_name + '/*"}]}'
            )
        else:
            raise e  # Raise other errors

# Ensure bucket exists at startup
ensure_bucket_exists()
