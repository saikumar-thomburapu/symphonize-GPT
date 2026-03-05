/**
 * API Key Management Modal
 * Allows users to create, view, and revoke API keys
 */

'use client';

import { useState, useEffect } from 'react';
import { X, Plus, Trash2, Copy, Check, Key, Eye, EyeOff, AlertTriangle, Clock, ChevronDown, ChevronUp, Terminal, Code2 } from 'lucide-react';
import { createApiKey, listApiKeys, revokeApiKey } from '@/lib/api';

// ── Usage Guide component (shown inside the modal) ──────────────────
function HowToUse() {
    const [open, setOpen] = useState(false);
    const [copied, setCopied] = useState(null);
    const SERVER = typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.hostname}:8000` : 'http://<server>:8000';

    const pythonCode = `import requests

response = requests.post(
    "${SERVER}/chat/v1/generate",
    headers={"X-API-Key": "sk_live_YOUR_KEY_HERE"},
    json={"message": "What is Python?"}
)

print(response.json()["reply"])`;

    const curlCode = `curl -X POST "${SERVER}/chat/v1/generate" \\
  -H "X-API-Key: sk_live_YOUR_KEY_HERE" \\
  -H "Content-Type: application/json" \\
  -d '{"message": "What is Python?"}'`;

    const jsCode = `const response = await fetch("${SERVER}/chat/v1/generate", {
  method: "POST",
  headers: {
    "X-API-Key": "sk_live_YOUR_KEY_HERE",
    "Content-Type": "application/json"
  },
  body: JSON.stringify({ message: "What is Python?" })
});
const data = await response.json();
console.log(data.reply);`;

    async function copyCode(text, id) {
        await navigator.clipboard.writeText(text);
        setCopied(id);
        setTimeout(() => setCopied(null), 2000);
    }

    const CodeBlock = ({ id, label, icon, code }) => (
        <div className="mt-3">
            <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-[#7fa3d1] flex items-center gap-1">{icon} {label}</span>
                <button
                    onClick={() => copyCode(code, id)}
                    className="flex items-center gap-1 text-xs text-[#4a7a9b] hover:text-blue-400 transition-colors"
                >
                    {copied === id ? <><Check className="w-3 h-3" /> Copied!</> : <><Copy className="w-3 h-3" /> Copy</>}
                </button>
            </div>
            <pre className="bg-[#010f1a] border border-[#043850] rounded-lg p-3 text-xs text-[#b3d4f7] font-mono overflow-x-auto whitespace-pre">
                {code}
            </pre>
        </div>
    );

    return (
        <div className="border border-[#043850] rounded-xl overflow-hidden">
            <button
                onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between px-4 py-3 text-sm text-[#7fa3d1] hover:bg-[#032a42] transition-colors"
            >
                <span className="flex items-center gap-2 font-medium">
                    <Terminal className="w-4 h-4 text-blue-400" />
                    How to use your API Key
                </span>
                {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {open && (
                <div className="px-4 pb-4 border-t border-[#043850] bg-[#010f1a]/30">
                    <p className="text-xs text-[#4a7a9b] mt-3 mb-1">
                        Add <code className="text-[#7fa3d1] bg-[#021e35] px-1 py-0.5 rounded">X-API-Key: sk_live_...</code> header to any request. No login required.
                    </p>

                    <CodeBlock id="python" label="Python" icon="🐍" code={pythonCode} />
                    <CodeBlock id="curl" label="cURL / Terminal" icon="💻" code={curlCode} />
                    <CodeBlock id="js" label="JavaScript / Node.js" icon="⚡" code={jsCode} />

                    <p className="text-xs text-[#4a7a9b] mt-3">
                        Response: <code className="text-[#7fa3d1]">{'{"reply": "...", "model": "..."}'}</code>
                    </p>
                </div>
            )}
        </div>
    );
}
// ────────────────────────────────────────────────────────────────────

export default function APIKeyModal({ isOpen, onClose }) {
    const [keys, setKeys] = useState([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [newKeyName, setNewKeyName] = useState('');
    const [expiresInDays, setExpiresInDays] = useState('');
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [newlyCreatedKey, setNewlyCreatedKey] = useState(null); // shown once
    const [copiedKeyId, setCopiedKeyId] = useState(null);
    const [revokingId, setRevokingId] = useState(null);
    const [error, setError] = useState('');

    // Load keys when modal opens
    useEffect(() => {
        if (isOpen) {
            fetchKeys();
        }
    }, [isOpen]);

    async function fetchKeys() {
        try {
            setLoading(true);
            setError('');
            const data = await listApiKeys();
            setKeys(data.api_keys || []);
        } catch (err) {
            setError('Failed to load API keys');
        } finally {
            setLoading(false);
        }
    }

    async function handleCreate(e) {
        e.preventDefault();
        if (!newKeyName.trim()) return;

        try {
            setCreating(true);
            setError('');
            const data = await createApiKey(
                newKeyName.trim(),
                expiresInDays ? parseInt(expiresInDays) : null
            );
            setNewlyCreatedKey(data.api_key); // Save to show once
            setKeys(prev => [data.key_info, ...prev]);
            setNewKeyName('');
            setExpiresInDays('');
            setShowCreateForm(false);
        } catch (err) {
            setError(err.detail || 'Failed to create API key');
        } finally {
            setCreating(false);
        }
    }

    async function handleRevoke(keyId) {
        if (!confirm('Are you sure you want to revoke this key? This cannot be undone.')) return;
        try {
            setRevokingId(keyId);
            await revokeApiKey(keyId);
            setKeys(prev => prev.filter(k => k.id !== keyId));
        } catch (err) {
            setError('Failed to revoke key');
        } finally {
            setRevokingId(null);
        }
    }

    async function copyToClipboard(text, id) {
        await navigator.clipboard.writeText(text);
        setCopiedKeyId(id);
        setTimeout(() => setCopiedKeyId(null), 2000);
    }

    function formatDate(dateStr) {
        if (!dateStr) return 'Never';
        return new Date(dateStr).toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric'
        });
    }

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-2xl bg-[#021e35] border border-[#043850] rounded-2xl shadow-2xl flex flex-col max-h-[85vh]">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-[#043850]">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-lg flex items-center justify-center shadow-lg">
                            <Key className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-white">API Keys</h2>
                            <p className="text-xs text-[#7fa3d1]">Manage programmatic access to your account</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-[#032a42] transition-colors text-[#7fa3d1] hover:text-white"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Scrollable content */}
                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">

                    {/* Error */}
                    {error && (
                        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm">
                            <AlertTriangle className="w-4 h-4 shrink-0" />
                            {error}
                        </div>
                    )}

                    {/* Newly created key — show once */}
                    {newlyCreatedKey && (
                        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 space-y-3">
                            <div className="flex items-center gap-2 text-green-400 font-semibold text-sm">
                                <Check className="w-4 h-4" />
                                API Key Created — Copy it now! It won't be shown again.
                            </div>
                            <div className="flex items-center gap-2 bg-[#021e35] rounded-lg px-3 py-2 border border-green-500/20">
                                <code className="flex-1 text-xs text-green-300 font-mono break-all">
                                    {newlyCreatedKey}
                                </code>
                                <button
                                    onClick={() => copyToClipboard(newlyCreatedKey, 'new')}
                                    className="shrink-0 p-1.5 rounded-md hover:bg-green-500/20 transition-colors text-green-400"
                                    title="Copy key"
                                >
                                    {copiedKeyId === 'new' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                </button>
                            </div>
                            <button
                                onClick={() => setNewlyCreatedKey(null)}
                                className="text-xs text-green-500/70 hover:text-green-400 transition-colors"
                            >
                                I've saved it, dismiss this
                            </button>
                        </div>
                    )}

                    {/* Create form */}
                    {showCreateForm ? (
                        <form onSubmit={handleCreate} className="bg-[#032a42] border border-[#043850] rounded-xl p-4 space-y-3">
                            <h3 className="text-sm font-semibold text-white">New API Key</h3>
                            <div>
                                <label className="text-xs text-[#7fa3d1] mb-1 block">Key Name *</label>
                                <input
                                    type="text"
                                    value={newKeyName}
                                    onChange={e => setNewKeyName(e.target.value)}
                                    placeholder="e.g. Production App, Srinath's Project"
                                    className="w-full bg-[#021e35] border border-[#043850] rounded-lg px-3 py-2 text-sm text-white placeholder-[#4a7a9b] focus:outline-none focus:border-blue-500 transition-colors"
                                    autoFocus
                                    maxLength={100}
                                />
                            </div>
                            <div>
                                <label className="text-xs text-[#7fa3d1] mb-1 block">Expires in (days) — leave blank for no expiry</label>
                                <input
                                    type="number"
                                    value={expiresInDays}
                                    onChange={e => setExpiresInDays(e.target.value)}
                                    placeholder="e.g. 30, 90, 365"
                                    className="w-full bg-[#021e35] border border-[#043850] rounded-lg px-3 py-2 text-sm text-white placeholder-[#4a7a9b] focus:outline-none focus:border-blue-500 transition-colors"
                                    min={1}
                                    max={3650}
                                />
                            </div>
                            <div className="flex gap-2 pt-1">
                                <button
                                    type="submit"
                                    disabled={creating || !newKeyName.trim()}
                                    className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium py-2 rounded-lg transition-colors"
                                >
                                    {creating ? 'Creating...' : 'Create Key'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { setShowCreateForm(false); setNewKeyName(''); setExpiresInDays(''); }}
                                    className="px-4 py-2 text-sm text-[#7fa3d1] hover:text-white bg-[#021e35] border border-[#043850] rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    ) : (
                        <button
                            onClick={() => setShowCreateForm(true)}
                            className="w-full flex items-center justify-center gap-2 py-2.5 border border-dashed border-[#043850] hover:border-blue-500/50 rounded-xl text-sm text-[#7fa3d1] hover:text-blue-400 transition-all group"
                        >
                            <Plus className="w-4 h-4 group-hover:scale-110 transition-transform" />
                            Create new API key
                        </button>
                    )}

                    {/* Keys list */}
                    {loading ? (
                        <div className="space-y-3">
                            {[1, 2].map(i => (
                                <div key={i} className="h-20 bg-[#032a42] rounded-xl animate-pulse" />
                            ))}
                        </div>
                    ) : keys.length === 0 ? (
                        <div className="text-center py-10 text-[#4a7a9b]">
                            <Key className="w-10 h-10 mx-auto mb-3 opacity-30" />
                            <p className="text-sm">No API keys yet</p>
                            <p className="text-xs mt-1">Create one to get started</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {keys.map(key => (
                                <div
                                    key={key.id}
                                    className={`bg-[#032a42] border rounded-xl px-4 py-3 transition-all ${key.is_active
                                        ? 'border-[#043850] hover:border-blue-500/30'
                                        : 'border-red-500/20 opacity-60'
                                        }`}
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="text-sm font-medium text-white truncate">{key.key_name}</span>
                                                {key.is_active ? (
                                                    <span className="text-xs bg-green-500/15 text-green-400 border border-green-500/20 px-2 py-0.5 rounded-full">Active</span>
                                                ) : (
                                                    <span className="text-xs bg-red-500/15 text-red-400 border border-red-500/20 px-2 py-0.5 rounded-full">Revoked</span>
                                                )}
                                            </div>

                                            {/* Key prefix */}
                                            <div className="flex items-center gap-1.5 mt-1.5">
                                                <code className="text-xs text-[#4a7a9b] font-mono">{key.key_prefix}...</code>
                                                <button
                                                    onClick={() => copyToClipboard(key.key_prefix, key.id)}
                                                    className="text-[#4a7a9b] hover:text-blue-400 transition-colors"
                                                    title="Copy prefix"
                                                >
                                                    {copiedKeyId === key.id
                                                        ? <Check className="w-3.5 h-3.5 text-green-400" />
                                                        : <Copy className="w-3.5 h-3.5" />}
                                                </button>
                                            </div>

                                            {/* Metadata */}
                                            <div className="flex items-center gap-3 mt-2 text-xs text-[#4a7a9b]">
                                                <span>Created {formatDate(key.created_at)}</span>
                                                {key.last_used_at && <span>· Last used {formatDate(key.last_used_at)}</span>}
                                                {key.expires_at && (
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="w-3 h-3" />
                                                        Expires {formatDate(key.expires_at)}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Revoke button */}
                                        {key.is_active && (
                                            <button
                                                onClick={() => handleRevoke(key.id)}
                                                disabled={revokingId === key.id}
                                                className="shrink-0 p-2 rounded-lg text-[#4a7a9b] hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                                                title="Revoke key"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* ── How to use your API Key ── */}
                    <HowToUse />

                </div>

                {/* Footer */}
                <div className="px-6 py-3 border-t border-[#043850]">
                    <p className="text-xs text-[#4a7a9b] text-center">
                        Use <code className="text-[#7fa3d1]">X-API-Key: sk_live_...</code> header in your HTTP requests
                    </p>
                </div>
            </div>
        </div>
    );
}

