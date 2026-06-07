"use client";

import { useState, FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Button from "@/components/ui/Button";
import Calendar from "@/components/coffee/Calendar";
import { createCoffeeRequest } from "@/lib/api";

interface FormData {
  name: string;
  email: string;
  preferred_datetime: string;
  location: string;
  topic: string;
}

const topics = [
  "Backend Architecture",
  "Career Advice",
  "Startup Idea",
  "Open Source",
  "Collaboration",
  "Other",
];

export default function CoffeePage() {
  const [form, setForm] = useState<FormData>({
    name: "",
    email: "",
    preferred_datetime: "",
    location: "Online (Zoom/Meet)",
    topic: "",
  });
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const toggleTopic = (topic: string) => {
    setSelectedTopics((prev) =>
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]
    );
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.preferred_datetime) {
      setError("Please select a date and time.");
      return;
    }

    const fullTopic = selectedTopics.length > 0
      ? `[Topics: ${selectedTopics.join(", ")}]\n\n${form.topic}`
      : form.topic;

    if (fullTopic.length < 20 || fullTopic.length > 800) {
      setError("Topic must be at least 20 characters long.");
      return;
    }

    setSubmitting(true);
    try {
      await createCoffeeRequest({ ...form, topic: fullTopic });
      setSubmitted(true);
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-xl w-full bg-white/[0.02] border border-white/10 p-12 rounded-[3.5rem] text-center shadow-3xl"
        >
          <div className="text-7xl mb-8">☕</div>
          <h1 className="text-4xl font-bold text-white mb-6 tracking-tight">Request Sent!</h1>
          <p className="text-white/40 text-lg leading-relaxed mb-12">
            Thanks! Your request has been received. I will respond via email shortly.
          </p>
          <Button href="/" variant="primary" className="rounded-2xl px-12 py-4">Back Home</Button>
        </motion.div>
      </div>
    );
  }

  const inputClass =
    "w-full bg-white/[0.02] border border-white/5 rounded-2xl px-5 py-4 text-white placeholder-white/20 focus:outline-none focus:border-accent-primary/20 focus:bg-white/[0.04] transition-all font-medium text-sm";

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      <div className="max-w-6xl mx-auto px-4 pt-32 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-start">

          {/* Left Column: Info Section */}
          <div className="lg:col-span-5 space-y-12">
            <div className="space-y-6">
              <div className="inline-block text-[10px] font-mono text-white/20 uppercase tracking-[0.5em]">Connect</div>
              <div className="relative">
                <h1 className="text-7xl font-bold tracking-tighter leading-none relative z-10">Coffee</h1>
                <div className="text-6xl font-bold italic text-white/5 absolute -bottom-8 left-2 select-none">chat.</div>
              </div>
              <p className="text-white/60 text-lg leading-relaxed pt-8 max-w-md font-medium">
                Do you want to talk about technology, startups, or backend architecture?
                Or just want to get to know me? I&apos;m ready.
                I accept a few meetings every week. ☕
              </p>
            </div>

            <div className="space-y-4">
              {[
                {
                  label: "Duration",
                  val: "30 minutes. Can be extended if needed.",
                  icon: (
                    <svg className="w-5 h-5 text-accent-primary/60" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                  ),
                },
                {
                  label: "Format",
                  val: "Zoom, Google Meet, or a cafe in Tashkent.",
                  icon: (
                    <svg className="w-5 h-5 text-accent-primary/60" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
                    </svg>
                  ),
                },
                {
                  label: "Response time",
                  val: "I will respond via email within 24 hours.",
                  icon: (
                    <svg className="w-5 h-5 text-accent-primary/60" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                    </svg>
                  ),
                },
              ].map((item) => (
                <div key={item.label} className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 flex gap-4 transition-all hover:bg-white/[0.04]">
                  <div className="w-10 h-10 rounded-xl bg-accent-primary/10 border border-accent-primary/10 flex items-center justify-center shrink-0">
                    {item.icon}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white mb-1 uppercase tracking-wider">{item.label}</h4>
                    <p className="text-[11px] text-white/30 leading-relaxed">{item.val}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-8 italic text-white/60 text-base leading-relaxed border-t border-white/10 font-medium">
              &quot;I set aside time for interesting conversations, not for sales. If you are the same — write to me.&quot;
            </div>
          </div>

          {/* Right Column: Form Section */}
          <div className="lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white/[0.01] border border-white/10 p-8 md:p-12 rounded-[3.5rem] shadow-3xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-accent-primary/5 blur-[100px] pointer-events-none" />

              <div className="mb-12">
                <h2 className="text-3xl font-black text-white tracking-tighter uppercase">Send Request</h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] ml-2">Name</label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Your full name"
                      className={inputClass}
                    />
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] ml-2">Email Address</label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="email@domail.uz"
                      className={inputClass}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] ml-2">Schedule Discussion</label>
                  <Calendar
                    selectedDateTime={form.preferred_datetime}
                    onSelect={(datetime) => {
                      setForm({ ...form, preferred_datetime: datetime });
                      setError("");
                    }}
                  />
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] ml-2">Format</label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {["Online (Zoom/Meet)", "Offline (Tashkent)", "Other"].map((fmt) => (
                      <button
                        key={fmt}
                        type="button"
                        onClick={() => setForm({ ...form, location: fmt })}
                        className={`w-full py-4 px-6 rounded-2xl text-xs font-bold transition-all border ${
                          form.location === fmt
                            ? "bg-white/10 border-white/20 text-white"
                            : "bg-white/[0.02] border-white/5 text-white/40 hover:bg-white/[0.04] hover:text-white/60 hover:border-white/10"
                        }`}
                      >
                        {fmt}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[9px] font-bold text-white/20 uppercase tracking-[0.2em] ml-1">Topic</label>
                  <div className="flex flex-wrap gap-2">
                    {topics.map((topic) => (
                      <button
                        key={topic}
                        type="button"
                        onClick={() => toggleTopic(topic)}
                        className={`px-5 py-2.5 rounded-2xl text-[11px] font-medium border transition-all duration-300 ${selectedTopics.includes(topic)
                          ? "bg-white/10 border-white/20 text-white"
                          : "bg-transparent border-white/5 text-white/40 hover:border-white/10 hover:text-white/60"
                          }`}
                      >
                        {topic}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] ml-2">What will we talk about?</label>
                  <textarea
                    required
                    rows={6}
                    value={form.topic}
                    onChange={(e) => setForm({ ...form, topic: e.target.value })}
                    placeholder="Tell me a bit about yourself and what you'd like to discuss..."
                    className={`${inputClass} resize-none py-5`}
                    minLength={20}
                    maxLength={600}
                  />
                  <div className="flex justify-end pr-2">
                    <p className="text-[9px] text-white/10 font-black uppercase tracking-widest">{form.topic.length}/600</p>
                  </div>
                </div>

                {error && <p className="text-red-400 text-[10px] font-bold uppercase tracking-widest px-1">{error}</p>}

                <div className="pt-4">
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-5 rounded-2xl text-lg font-bold shadow-[0_15px_30px_rgba(245,158,11,0.15)] bg-white/5 hover:bg-white/10 transition-all border border-white/10"
                  >
                    {submitting ? "Sending..." : "Submit Request"}
                  </Button>
                  <div className="text-center mt-6">
                    <p className="text-[9px] text-white/20 font-bold uppercase tracking-wider">
                      Not spam — only interesting people should write. 😎
                    </p>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        </div>

        {/* Footer info matching About page */}
        <div className="pt-24 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-8 mt-12 opacity-30">
          <div className="text-[10px] font-mono text-white/20 uppercase tracking-[0.5em]">ThompsonShell</div>
          <div className="text-[10px] font-mono text-white/20 uppercase tracking-[0.5em]">Tashkent | 2026</div>
        </div>
      </div>
    </div>
  );
}
