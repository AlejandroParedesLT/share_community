-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create user_embeddings table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'user_embeddings'
    ) THEN
        CREATE TABLE user_embeddings (
            user_id INTEGER PRIMARY KEY REFERENCES auth_user(id) ON DELETE CASCADE,
            embedding vector(32),
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
        );
    END IF;
END
$$;
