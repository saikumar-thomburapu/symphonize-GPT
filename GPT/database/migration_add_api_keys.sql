-- Migration: Add API Keys Table
-- Run this on existing databases to add API key support
-- For new installations, use schema.sql instead

-- =====================================================
-- API KEYS TABLE
-- Stores API keys for programmatic access
-- =====================================================
CREATE TABLE IF NOT EXISTS api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    key_name VARCHAR(100) NOT NULL,
    key_hash TEXT NOT NULL,
    key_prefix VARCHAR(20) NOT NULL,  -- First 8 chars for identification (e.g., "sk_live_")
    last_used_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_key_prefix ON api_keys(key_prefix);
CREATE INDEX IF NOT EXISTS idx_api_keys_is_active ON api_keys(is_active);

-- Apply trigger to api_keys table (reuse existing function)
CREATE TRIGGER update_api_keys_updated_at
    BEFORE UPDATE ON api_keys
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add comments
COMMENT ON TABLE api_keys IS 'API keys for programmatic access to the chat API';
COMMENT ON COLUMN api_keys.key_hash IS 'Bcrypt hash of the API key (never store plain text)';
COMMENT ON COLUMN api_keys.key_prefix IS 'First 8-12 characters of key for identification (e.g., sk_live_abc)';

-- Verification query
-- Run this to verify the table was created successfully:
-- SELECT table_name, column_name, data_type FROM information_schema.columns WHERE table_name = 'api_keys';
