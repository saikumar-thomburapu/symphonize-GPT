-- Database Functions and Triggers
-- Auto-delete old data (30-day retention) and other utilities

-- =====================================================
-- FUNCTION: Delete conversations older than X days
-- This enforces your 30-day data retention policy
-- =====================================================
CREATE OR REPLACE FUNCTION delete_old_conversations(retention_days INTEGER DEFAULT 30)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
    cutoff_date TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Calculate cutoff date
    cutoff_date := CURRENT_TIMESTAMP - (retention_days || ' days')::INTERVAL;
    
    -- Delete old conversations (messages will cascade delete)
    WITH deleted AS (
        DELETE FROM conversations
        WHERE created_at < cutoff_date
        RETURNING id
    )
    SELECT COUNT(*) INTO deleted_count FROM deleted;
    
    -- Log deletion
    RAISE NOTICE 'Deleted % conversations older than % days', deleted_count, retention_days;
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FUNCTION: Delete orphaned messages
-- Clean up messages without parent conversations
-- =====================================================
CREATE OR REPLACE FUNCTION delete_orphaned_messages()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    WITH deleted AS (
        DELETE FROM messages
        WHERE conversation_id NOT IN (SELECT id FROM conversations)
        RETURNING id
    )
    SELECT COUNT(*) INTO deleted_count FROM deleted;
    
    RAISE NOTICE 'Deleted % orphaned messages', deleted_count;
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FUNCTION: Get user statistics
-- Useful for admin dashboard or user profile
-- =====================================================
CREATE OR REPLACE FUNCTION get_user_stats(user_uuid UUID)
RETURNS TABLE(
    total_conversations BIGINT,
    total_messages BIGINT,
    oldest_conversation_date TIMESTAMP WITH TIME ZONE,
    newest_conversation_date TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(DISTINCT c.id) as total_conversations,
        COUNT(m.id) as total_messages,
        MIN(c.created_at) as oldest_conversation_date,
        MAX(c.created_at) as newest_conversation_date
    FROM conversations c
    LEFT JOIN messages m ON m.conversation_id = c.id
    WHERE c.user_id = user_uuid
    GROUP BY c.user_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FUNCTION: Update conversation title from first message
-- Auto-generate meaningful titles
-- =====================================================
CREATE OR REPLACE FUNCTION auto_generate_conversation_title()
RETURNS TRIGGER AS $$
DECLARE
    first_message TEXT;
    generated_title TEXT;
BEGIN
    -- Only run for first message in conversation
    IF NOT EXISTS (
        SELECT 1 FROM messages 
        WHERE conversation_id = NEW.conversation_id 
        AND id != NEW.id
    ) THEN
        -- Get first 50 characters of user message
        IF NEW.role = 'user' THEN
            first_message := SUBSTRING(NEW.content FROM 1 FOR 50);
            
            -- Add ellipsis if truncated
            IF LENGTH(NEW.content) > 50 THEN
                generated_title := first_message || '...';
            ELSE
                generated_title := first_message;
            END IF;
            
            -- Update conversation title
            UPDATE conversations
            SET title = generated_title
            WHERE id = NEW.conversation_id
            AND title = 'New Conversation';  -- Only update default titles
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply auto-title trigger
CREATE TRIGGER auto_generate_title_trigger
    AFTER INSERT ON messages
    FOR EACH ROW
    EXECUTE FUNCTION auto_generate_conversation_title();

-- =====================================================
-- SCHEDULED JOB: Auto-delete old data daily
-- Note: Requires pg_cron extension (available in Supabase Pro)
-- For free tier, call this function from your backend instead
-- =====================================================

-- Enable pg_cron extension (Pro tier only)
-- CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule daily cleanup at 2 AM UTC (Pro tier only)
-- SELECT cron.schedule(
--     'delete-old-conversations-daily',
--     '0 2 * * *',  -- Every day at 2 AM
--     $$SELECT delete_old_conversations(30)$$
-- );

-- For free tier, call this from your backend:
-- Example: In backend, schedule a daily task that calls:
-- supabase_service.service_client.rpc('delete_old_conversations', {'retention_days': 30}).execute()

-- =====================================================
-- FUNCTION: Bulk delete user data (GDPR compliance)
-- For when user requests account deletion
-- =====================================================
CREATE OR REPLACE FUNCTION delete_user_data(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    -- Delete all user's conversations (messages cascade)
    DELETE FROM conversations WHERE user_id = user_uuid;
    
    -- Delete user account
    DELETE FROM users WHERE id = user_uuid;
    
    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error deleting user data: %', SQLERRM;
        RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================
COMMENT ON FUNCTION delete_old_conversations IS 'Deletes conversations older than specified days (default 30)';
COMMENT ON FUNCTION delete_orphaned_messages IS 'Cleans up messages without parent conversations';
COMMENT ON FUNCTION get_user_stats IS 'Returns statistics for a specific user';
COMMENT ON FUNCTION auto_generate_conversation_title IS 'Auto-generates conversation title from first message';
COMMENT ON FUNCTION delete_user_data IS 'Completely removes all user data (GDPR compliance)';
