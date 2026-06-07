"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { getLecture, getLectures } from "@/lib/api";
import type { Lecture } from "@/lib/types";
import Skeleton from "@/components/ui/Skeleton";

const VideoPlayer = dynamic(() => import("@/components/lectures/VideoPlayer"), { ssr: false });
const Terminal = dynamic(() => import("../../../components/lectures/Terminal"), { ssr: false });

export default function LectureDetailPage() {
    const { id } = useParams() as { id: string };
    const [lecture, setLecture] = useState<Lecture | null>(null);
    const [allLectures, setAllLectures] = useState<Lecture[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        Promise.all([getLecture(id), getLectures(undefined, undefined)])
            .then(([data, all]) => {
                setLecture(data);
                setAllLectures(all);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-black pt-32 pb-24 px-4 text-white">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
                    <div className="lg:col-span-6 space-y-8">
                        <Skeleton className="aspect-video w-full rounded-[2.5rem] bg-white/5" />
                        <Skeleton className="h-12 w-1/2 rounded-2xl bg-white/5" />
                        <Skeleton className="h-24 w-full rounded-2xl bg-white/5" />
                    </div>
                    <div className="lg:col-span-6">
                        <Skeleton className="h-[600px] w-full rounded-2xl bg-white/5" />
                    </div>
                </div>
            </div>
        );
    }

    if (!lecture) {
        return (
            <div className="min-h-screen bg-black text-white pt-32 pb-24 px-4 flex flex-col items-center justify-center">
                <h1 className="text-4xl font-bold mb-4">Lecture not found</h1>
                <p className="text-white/60">Could not retrieve the lecture. Check console for fetch errors or return to lectures list.</p>
                <Link href="/lectures" className="mt-8 px-6 py-3 bg-white/10 rounded-xl hover:bg-white/20 transition-all font-medium">All Lectures</Link>
            </div>
        );
    }

    const formatDuration = (seconds: number): string => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes}:${secs.toString().padStart(2, "0")}`;
    };

    return (
        <div className="min-h-screen bg-black text-white">
            <div className="max-w-[90rem] mx-auto px-4 pt-32 pb-24">

                {/* Breadcrumbs */}
                <nav className="flex items-center gap-3 text-[11px] font-medium text-white/20 uppercase tracking-widest mb-12">
                    <Link href="/lectures" className="text-white/40 hover:text-white transition-colors">Lectures</Link>
                    <span className="w-1 h-1 rounded-full bg-white/20" />
                    <span className="text-white/60">{lecture.category}</span>
                    <span className="w-1 h-1 rounded-full bg-white/10" />
                    <span className="text-white truncate max-w-[200px] md:max-w-none">{lecture.title}</span>
                </nav>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-12">
                    {/* Main Content - Video Player */}
                    <div className="lg:col-span-5 space-y-6">
                        <div className="space-y-4">
                            <div className="text-[10px] font-mono text-white/40 uppercase">Lecture {lecture.order || 1}</div>
                            <VideoPlayer
                                videoId={lecture.youtube_video_id}
                                duration={formatDuration(lecture.duration_seconds)}
                            />
                        </div>

                        {/* Info Section */}
                        <div className="space-y-6">
                            <h1 className="text-2xl md:text-3xl font-bold tracking-tighter text-white">
                                {lecture.title}
                            </h1>

                            <p className="text-sm text-white/60 leading-relaxed">
                                {lecture.description || "This lecture covers core backend concepts and their real-world implementation principles. Detailed explanations are provided in the video."}
                            </p>

                            <div className="flex flex-wrap gap-2 pt-2">
                                {[lecture.category, "Beginner", `${Math.floor(lecture.duration_seconds / 60)} min`].map(tag => (
                                    <span key={tag} className="px-4 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[10px] font-medium text-white/60">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>

                    </div>

                    {/* Sidebar - Terminal */}
                    <div className="lg:col-span-7 h-[600px] lg:h-[800px]">
                        <Terminal />
                    </div>
                </div>

                {/* Bottom Section - All Lectures List */}
                <div className="mt-12 pt-12 border-t border-white/5">
                    <div className="flex items-center justify-between mb-8">
                        <div className="text-[11px] font-mono text-white/40 uppercase tracking-[0.2em]">
                            Browse More Lectures
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {allLectures.map((l, idx) => (
                            <Link
                                key={l.id}
                                href={`/lectures/${l.id}`}
                                className={`flex items-start gap-4 p-4 rounded-2xl border transition-all group ${l.id === parseInt(id)
                                    ? "bg-white/5 border-white/10"
                                    : "bg-transparent border-transparent hover:bg-white/[0.02] hover:border-white/5"
                                    }`}
                            >
                                <div className="relative w-24 flex-shrink-0 aspect-video rounded-lg overflow-hidden border border-white/5">
                                    <Image
                                        src={l.thumbnail_url}
                                        alt={l.title}
                                        fill
                                        className={`object-cover ${l.id === parseInt(id) ? "opacity-80" : "opacity-50 group-hover:opacity-80"} transition-opacity`}
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <svg className={`w-4 h-4 ${l.id === parseInt(id) ? "text-white" : "text-white/20 group-hover:text-white/40"}`} fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M8 5v14l11-7z" />
                                        </svg>
                                    </div>
                                    <div className="absolute bottom-1 right-1 text-[8px] font-bold text-white/60 bg-black/60 px-1 rounded">
                                        {formatDuration(l.duration_seconds)}
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <div className="text-xs font-medium text-white/80 group-hover:text-white transition-colors line-clamp-2">
                                        {idx + 1}. {l.title}
                                    </div>
                                    <div className="flex items-center gap-2 text-[9px] text-white/40 font-mono mt-2">
                                        <span>{l.category}</span>
                                        <span className="w-1 h-1 rounded-full bg-white/5" />
                                        <span className={l.id === parseInt(id) ? "text-[#27C93F]" : ""}>
                                            {l.id === parseInt(id) ? "Current" : "Watch Now"}
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
