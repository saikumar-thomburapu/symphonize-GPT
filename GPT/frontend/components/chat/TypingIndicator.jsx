'use client';

export default function TypingIndicator() {
  return (
    <div className="flex gap-4 px-6 py-4 animate-fade-in">
      {/* Avatar */}
      <div className="flex-shrink-0 w-8 h-8 rounded-xl overflow-hidden border border-white/[0.08] shadow-lg">
        <img src="/images/symphonize_logo.jpg" alt="AI" className="w-full h-full object-cover" />
      </div>

      {/* Bubble */}
      <div className="flex items-center gap-1.5 px-4 py-3 rounded-2xl rounded-bl-sm"
        style={{ background: 'rgba(3,42,66,0.7)', border: '1px solid rgba(255,255,255,0.06)', boxShadow: '0 4px 16px rgba(0,0,0,0.3)' }}>
        <span className="dot-bounce-1 w-2 h-2 rounded-full bg-[#3e78c2] inline-block" />
        <span className="dot-bounce-2 w-2 h-2 rounded-full bg-[#5299d3] inline-block" />
        <span className="dot-bounce-3 w-2 h-2 rounded-full bg-[#66c5fb] inline-block" />
      </div>
    </div>
  );
}
