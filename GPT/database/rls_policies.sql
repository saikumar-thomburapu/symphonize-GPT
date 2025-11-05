-- Row Level Security (RLS) Policies
-- Ensures users can only access their own data

-- =====================================================
-- ENABLE ROW LEVEL SECURITY
-- This activates security - without it, anyone can see all data!
-- =====================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- USERS TABLE POLICIES
-- Users can only see and update their own account
-- =====================================================

-- Policy: Users can read their own data
CREATE POLICY "Users can view own account"
    ON users
    FOR SELECT
    USING (id = auth.uid());

-- Policy: Users can update their own data
CREATE POLICY "Users can update own account"
    ON users
    FOR UPDATE
    USING (id = auth.uid());

-- Policy: Anyone can insert (for signup)
-- Note: In production, you might want to handle this differently
-- For now, service role key bypasses RLS for user creation
CREATE POLICY "Enable insert for service role"
    ON users
    FOR INSERT
    WITH CHECK (true);

-- =====================================================
-- CONVERSATIONS TABLE POLICIES
-- Users can only see/modify their own conversations
-- =====================================================

-- Policy: Users can view their own conversations
CREATE POLICY "Users can view own conversations"
    ON conversations
    FOR SELECT
    USING (user_id = auth.uid());

-- Policy: Users can insert their own conversations
CREATE POLICY "Users can create own conversations"
    ON conversations
    FOR INSERT
    WITH CHECK (user_id = auth.uid());

-- Policy: Users can update their own conversations
CREATE POLICY "Users can update own conversations"
    ON conversations
    FOR UPDATE
    USING (user_id = auth.uid());

-- Policy: Users can delete their own conversations
CREATE POLICY "Users can delete own conversations"
    ON conversations
    FOR DELETE
    USING (user_id = auth.uid());

-- =====================================================
-- MESSAGES TABLE POLICIES
-- Users can only see/modify messages in their conversations
-- =====================================================

-- Policy: Users can view messages in their conversations
CREATE POLICY "Users can view messages in own conversations"
    ON messages
    FOR SELECT
    USING (
        conversation_id IN (
            SELECT id FROM conversations WHERE user_id = auth.uid()
        )
    );

-- Policy: Users can insert messages in their conversations
CREATE POLICY "Users can create messages in own conversations"
    ON messages
    FOR INSERT
    WITH CHECK (
        conversation_id IN (
            SELECT id FROM conversations WHERE user_id = auth.uid()
        )
    );

-- Policy: Users can delete messages in their conversations
CREATE POLICY "Users can delete messages in own conversations"
    ON messages
    FOR DELETE
    USING (
        conversation_id IN (
            SELECT id FROM conversations WHERE user_id = auth.uid()
        )
    );

-- =====================================================
-- SERVICE ROLE BYPASS
-- Backend using service role key can bypass RLS
-- This allows backend to perform admin operations
-- =====================================================

-- Already handled by Supabase - service_role key bypasses all RLS
-- Your backend uses this for operations like user creation

-- =====================================================
-- GRANT PERMISSIONS
-- Grant necessary permissions to authenticated users
-- =====================================================

GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON users TO authenticated;
GRANT ALL ON conversations TO authenticated;
GRANT ALL ON messages TO authenticated;
