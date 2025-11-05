import React, { useState } from "react";

export default function AIAvatar() {
  const [videoReady, setVideoReady] = useState(false);

  return (
    <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-[#032a42] border border-[#043850] relative overflow-hidden">
      <video
        autoPlay
        loop
        muted
        preload="auto"
        onCanPlay={() => setVideoReady(true)}
        className={`w-full h-full object-cover ${videoReady ? "opacity-100" : "opacity-0"}`}
      >
        <source src="/videos/symphonize_logo_animation.mp4" type="video/mp4" />
      </video>

      {!videoReady && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2 h-2 bg-[#66c5fb] rounded-full animate-pulse"></div>
        </div>
      )}
    </div>
  );
}
