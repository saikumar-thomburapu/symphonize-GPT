#!/bin/bash

echo "Checking frontend file structure..."
echo ""

# Check lib files
echo "=== LIB FILES ==="
test -f lib/api.js && echo "✅ lib/api.js" || echo "❌ lib/api.js MISSING"
test -f lib/utils.js && echo "✅ lib/utils.js" || echo "❌ lib/utils.js MISSING"
test -f lib/supabase.js && echo "✅ lib/supabase.js" || echo "❌ lib/supabase.js MISSING"

# Check components/ui files
echo ""
echo "=== COMPONENTS/UI FILES ==="
test -f components/ui/Button.jsx && echo "✅ components/ui/Button.jsx" || echo "❌ components/ui/Button.jsx MISSING"
test -f components/ui/Input.jsx && echo "✅ components/ui/Input.jsx" || echo "❌ components/ui/Input.jsx MISSING"
test -f components/ui/Logo.jsx && echo "✅ components/ui/Logo.jsx" || echo "❌ components/ui/Logo.jsx MISSING"

# Check components/auth files
echo ""
echo "=== COMPONENTS/AUTH FILES ==="
test -f components/auth/LoginForm.jsx && echo "✅ components/auth/LoginForm.jsx" || echo "❌ components/auth/LoginForm.jsx MISSING"
test -f components/auth/SignupForm.jsx && echo "✅ components/auth/SignupForm.jsx" || echo "❌ components/auth/SignupForm.jsx MISSING"

# Check components/layout files
echo ""
echo "=== COMPONENTS/LAYOUT FILES ==="
test -f components/layout/Header.jsx && echo "✅ components/layout/Header.jsx" || echo "❌ components/layout/Header.jsx MISSING"
test -f components/layout/UserMenu.jsx && echo "✅ components/layout/UserMenu.jsx" || echo "❌ components/layout/UserMenu.jsx MISSING"

# Check components/chat files
echo ""
echo "=== COMPONENTS/CHAT FILES ==="
test -f components/chat/Sidebar.jsx && echo "✅ components/chat/Sidebar.jsx" || echo "❌ components/chat/Sidebar.jsx MISSING"
test -f components/chat/ConversationItem.jsx && echo "✅ components/chat/ConversationItem.jsx" || echo "❌ components/chat/ConversationItem.jsx MISSING"
test -f components/chat/ModelSelector.jsx && echo "✅ components/chat/ModelSelector.jsx" || echo "❌ components/chat/ModelSelector.jsx MISSING"
test -f components/chat/ChatMessage.jsx && echo "✅ components/chat/ChatMessage.jsx" || echo "❌ components/chat/ChatMessage.jsx MISSING"
test -f components/chat/ChatInput.jsx && echo "✅ components/chat/ChatInput.jsx" || echo "❌ components/chat/ChatInput.jsx MISSING"
test -f components/chat/TypingIndicator.jsx && echo "✅ components/chat/TypingIndicator.jsx" || echo "❌ components/chat/TypingIndicator.jsx MISSING"
test -f components/chat/ChatInterface.jsx && echo "✅ components/chat/ChatInterface.jsx" || echo "❌ components/chat/ChatInterface.jsx MISSING"

# Check app files
echo ""
echo "=== APP FILES ==="
test -f app/layout.js && echo "✅ app/layout.js" || echo "❌ app/layout.js MISSING"
test -f app/page.js && echo "✅ app/page.js" || echo "❌ app/page.js MISSING"
test -f app/login/page.js && echo "✅ app/login/page.js" || echo "❌ app/login/page.js MISSING"
test -f app/signup/page.js && echo "✅ app/signup/page.js" || echo "❌ app/signup/page.js MISSING"
test -f app/chat/page.js && echo "✅ app/chat/page.js" || echo "❌ app/chat/page.js MISSING"

# Check config files
echo ""
echo "=== CONFIG FILES ==="
test -f config/theme.js && echo "✅ config/theme.js" || echo "❌ config/theme.js MISSING"

# Check styles
echo ""
echo "=== STYLES FILES ==="
test -f styles/globals.css && echo "✅ styles/globals.css" || echo "❌ styles/globals.css MISSING"

# Check env
echo ""
echo "=== ENV FILES ==="
test -f .env.local && echo "✅ .env.local" || echo "❌ .env.local MISSING"

echo ""
echo "Check complete!"
