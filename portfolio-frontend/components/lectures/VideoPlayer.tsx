"use client";

import { useRef, useState, useEffect, useCallback } from "react";

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];

interface VideoPlayerProps {
    videoId: string;
    duration?: string;
}

declare global {
    interface Window {
        YT: any;
        onYouTubeIframeAPIReady: () => void;
    }
}

export default function VideoPlayer({ videoId, duration = "12:30" }: VideoPlayerProps) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const playerRef = useRef<any>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const progressRef = useRef<HTMLDivElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [speedIdx, setSpeedIdx] = useState(2);
    const [playerReady, setPlayerReady] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [totalDuration, setTotalDuration] = useState(0);
    const [progress, setProgress] = useState(0);
    const [isSeeking, setIsSeeking] = useState(false);
    const [ccEnabled, setCcEnabled] = useState(false);
    const playerContainerId = `yt-player-${videoId}`;

    useEffect(() => {
        function initPlayer() {
            if (!window.YT || !window.YT.Player) return;
            playerRef.current = new window.YT.Player(playerContainerId, {
                height: "100%",
                width: "100%",
                videoId,
                playerVars: {
                    controls: 0,
                    modestbranding: 1,
                    rel: 0,
                    disablekb: 1,
                    cc_load_policy: 1,
                    cc_lang_pref: 'uz',
                    hl: 'uz',
                },
                events: {
                    onReady: () => {
                        setPlayerReady(true);
                        const dur = playerRef.current?.getDuration?.() || 0;
                        if (dur > 0) setTotalDuration(dur);
                    },
                    onStateChange: (e: any) => {
                        setIsPlaying(e.data === window.YT.PlayerState.PLAYING);
                        const dur = playerRef.current?.getDuration?.() || 0;
                        if (dur > 0) setTotalDuration(dur);
                    },
                },
            });
        }

        if (window.YT && window.YT.Player) {
            initPlayer();
        } else {
            const tag = document.createElement("script");
            tag.src = "https://www.youtube.com/iframe_api";
            document.head.appendChild(tag);
            window.onYouTubeIframeAPIReady = initPlayer;
        }

        return () => {
            playerRef.current?.destroy();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [videoId]);

    // Poll current time
    useEffect(() => {
        if (!playerReady) return;
        const interval = setInterval(() => {
            if (playerRef.current && !isSeeking) {
                const ct = playerRef.current.getCurrentTime?.() || 0;
                const dur = playerRef.current.getDuration?.() || 0;
                setCurrentTime(ct);
                if (dur > 0) {
                    setTotalDuration(dur);
                    setProgress((ct / dur) * 100);
                }
            }
        }, 250);
        return () => clearInterval(interval);
    }, [playerReady, isSeeking]);

    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    const togglePlay = () => {
        if (!playerReady || !playerRef.current) return;
        if (isPlaying) playerRef.current.pauseVideo();
        else playerRef.current.playVideo();
    };

    const rewind = () => {
        if (!playerReady || !playerRef.current) return;
        const ct = playerRef.current.getCurrentTime();
        playerRef.current.seekTo(Math.max(ct - 10, 0), true);
    };

    const forward = () => {
        if (!playerReady || !playerRef.current) return;
        const ct = playerRef.current.getCurrentTime();
        playerRef.current.seekTo(ct + 10, true);
    };

    const changeSpeed = () => {
        const nextIdx = (speedIdx + 1) % SPEEDS.length;
        setSpeedIdx(nextIdx);
        if (playerReady && playerRef.current) {
            playerRef.current.setPlaybackRate(SPEEDS[nextIdx]);
        }
    };

    const handleSeek = useCallback((clientX: number) => {
        if (!progressRef.current || !playerRef.current) return;
        const dur = playerRef.current.getDuration?.() || 0;
        if (!dur) return;

        const rect = progressRef.current.getBoundingClientRect();
        const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
        const seekTime = ratio * dur;
        
        setProgress(ratio * 100);
        setCurrentTime(seekTime);
        playerRef.current.seekTo(seekTime, true);
    }, []);

    const handleProgressClick = (e: React.MouseEvent) => {
        handleSeek(e.clientX);
    };

    const handleProgressMouseDown = (e: React.MouseEvent) => {
        setIsSeeking(true);
        handleSeek(e.clientX);
        const onMove = (ev: MouseEvent) => handleSeek(ev.clientX);
        const onUp = () => {
            setIsSeeking(false);
            window.removeEventListener("mousemove", onMove);
            window.removeEventListener("mouseup", onUp);
        };
        window.addEventListener("mousemove", onMove);
        window.addEventListener("mouseup", onUp);
    };

    const toggleFullscreen = () => {
        if (!containerRef.current) return;
        if (document.fullscreenElement) {
            document.exitFullscreen();
        } else {
            containerRef.current.requestFullscreen();
        }
    };

    const toggleCC = () => {
        if (!playerRef.current) return;
        try {
            if (ccEnabled) {
                playerRef.current.unloadModule("captions");
                setCcEnabled(false);
            } else {
                playerRef.current.loadModule("captions");
                // Give module time to load, then set language
                setTimeout(() => {
                    try {
                        playerRef.current?.setOption?.("captions", "track", { languageCode: "uz" });
                    } catch {
                        // If uz not available, try auto-generated
                        try {
                            playerRef.current?.setOption?.("captions", "track", { languageCode: "" });
                        } catch { /* ignore */ }
                    }
                }, 300);
                setCcEnabled(true);
            }
        } catch {
            // Fallback — ignore
        }
    };

    return (
        <div ref={containerRef} className="flex flex-col gap-0">
            {/* Video Container */}
            <div className="relative aspect-video rounded-t-[2rem] overflow-hidden bg-black border border-white/5 border-b-0 shadow-2xl group">
                <div id={playerContainerId} className="w-full h-full" />

                {!isPlaying && (
                    <div
                        onClick={togglePlay}
                        className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-all cursor-pointer"
                    >
                        <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-2xl hover:scale-110 transition-transform">
                            <svg className="w-10 h-10 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                            </svg>
                        </div>
                    </div>
                )}

                <div className="absolute bottom-4 right-4 bg-black/80 backdrop-blur-md text-[11px] font-bold text-white px-2 py-1 rounded shadow-lg border border-white/10 pointer-events-none">
                    {totalDuration > 0 ? formatTime(totalDuration) : duration}
                </div>
            </div>

            {/* Progress Bar */}
            <div
                ref={progressRef}
                className="h-2 bg-white/10 cursor-pointer relative group"
                onClick={handleProgressClick}
                onMouseDown={handleProgressMouseDown}
            >
                <div
                    className="h-full bg-[#27C93F] relative transition-[width] duration-100"
                    style={{ width: `${progress}%` }}
                >
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-[#27C93F] border-[3px] border-[#0D0D0D] rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
            </div>

            {/* Custom Controls */}
            <div className="bg-black border border-white/5 border-t-0 p-4 rounded-b-[2rem] flex items-center justify-between gap-4">
                {/* Control Buttons */}
                <div className="flex items-center gap-2">
                    <button onClick={rewind} title="10 soniya orqaga"
                        className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white hover:bg-white/10 active:scale-95 transition-all">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M11 18V6l-8.5 6 8.5 6zm.5-6l8.5 6V6l-8.5 6z" /></svg>
                    </button>

                    <button onClick={togglePlay}
                        className="w-14 h-14 rounded-[1.25rem] bg-accent-primary text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(245,158,11,0.3)]">
                        {isPlaying ? (
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
                        ) : (
                            <svg className="w-6 h-6 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                        )}
                    </button>

                    <button onClick={forward} title="10 soniya oldinga"
                        className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white hover:bg-white/10 active:scale-95 transition-all">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M4 18l8.5-6L4 6v12zm9-12v12l8.5-6L13 6z" /></svg>
                    </button>
                </div>

                {/* Time and Settings */}
                <div className="flex items-center gap-4">
                    <div className="text-[11px] font-mono text-white/60 tracking-wider whitespace-nowrap">
                        <span>{formatTime(currentTime)}</span>
                        <span className="text-white/30 mx-1">/</span>
                        <span className="text-white/30">{totalDuration > 0 ? formatTime(totalDuration) : duration}</span>
                    </div>

                    <button onClick={changeSpeed} title="Tezlikni o'zgartirish"
                        className="px-4 py-2 rounded-xl bg-white/5 text-[11px] font-bold text-white hover:bg-white/10 active:scale-95 transition-all border border-white/5 min-w-[48px]">
                        {SPEEDS[speedIdx]}x
                    </button>

                    <button onClick={toggleCC} title="Subtitles"
                        className={`px-4 py-2 rounded-xl text-[11px] font-bold hover:bg-white/10 transition-colors border ${ccEnabled ? 'bg-white/15 text-white border-white/20' : 'bg-white/5 text-white/60 hover:text-white border-white/5'}`}>
                        CC
                    </button>

                    <button onClick={toggleFullscreen} title="Fullscreen"
                        className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white hover:bg-white/10 transition-colors border border-white/5">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}
