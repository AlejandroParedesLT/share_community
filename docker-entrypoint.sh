#!/bin/sh

# Ensure setup-minio.sh is executable
chmod +x /setup-minio.sh

# Now run the original setup-minio.sh script
/bin/sh /setup-minio.sh

# # Create the vector database in case it doesn't exist
# chmod +x /setup_embedding_model.sh
# # Now run the original setup_embedding_Model.sh script
# /bin/sh /setup_embedding_model.sh