import os
import boto3
import logging
from botocore.client import Config
from botocore.exceptions import ClientError
from django.conf import settings
import uuid

logger = logging.getLogger(__name__)

def get_s3_client():
    """
    Create a connection to the MinIO server using boto3
    """
    client = boto3.client(
        's3',
        endpoint_url=settings.MINIO_ENDPOINT_URL,
        aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
        config=Config(signature_version='s3v4'),
        region_name=settings.AWS_S3_REGION_NAME,
        verify=settings.MINIO_VERIFY_CERTIFICATES
    )
    return client

def upload_file(file_obj, folder_path=""):
    """
    Upload a file to MinIO
    
    Args:
        file_obj: The file object to be uploaded
        folder_path: The folder within the bucket to save the file
        
    Returns:
        str: The file path in storage
    """
    try:
        # Generate a unique filename to prevent overwrites
        extension = os.path.splitext(file_obj.name)[1].lower()
        filename = f"{uuid.uuid4()}{extension}"
        
        # Prepare the complete key (path within the bucket)
        key = os.path.join(folder_path, filename).replace('\\', '/')
        
        client = get_s3_client()
        
        # Upload the file
        client.upload_fileobj(
            file_obj,
            settings.AWS_STORAGE_BUCKET_NAME,
            key,
            ExtraArgs={
                'ContentType': file_obj.content_type,
                'ACL': 'public-read'
            }
        )
        
        return key
    except ClientError as e:
        logger.error(f"Failed to upload file to MinIO: {e}")
        raise Exception(f"File upload failed: {str(e)}")

def delete_file(file_path):
    """
    Delete a file from MinIO storage
    
    Args:
        file_path: The path of the file to delete
    """
    if not file_path:
        return
    
    try:
        # Handle different path formats
        if file_path.startswith('http'):
            # Extract the key from URL
            from urllib.parse import urlparse
            parsed_url = urlparse(file_path)
            key = parsed_url.path.lstrip('/')
            
            # Remove bucket name if it's in the path
            if key.startswith(settings.AWS_STORAGE_BUCKET_NAME + '/'):
                key = key[len(settings.AWS_STORAGE_BUCKET_NAME) + 1:]
        else:
            # Handle relative paths
            key = file_path.lstrip('/')
        
        client = get_s3_client()
        client.delete_object(
            Bucket=settings.AWS_STORAGE_BUCKET_NAME,
            Key=key
        )
        logger.info(f"Successfully deleted file: {key}")
    except ClientError as e:
        logger.error(f"Error deleting file from MinIO: {e}")
        # Don't raise the exception to prevent application flow from breaking
        pass