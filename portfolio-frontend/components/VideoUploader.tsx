"use client";

import { useEffect, useState } from "react";
import Uppy from "@uppy/core";
import Tus from "@uppy/tus";
import { Dashboard } from "@uppy/react";

import "@uppy/core/dist/style.min.css";
import "@uppy/dashboard/dist/style.min.css";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

const CHUNK_SIZE = 10 * 1024 * 1024; // 10 MB
const MAX_FILE_SIZE = 6 * 1024 * 1024 * 1024; // 6 GB
const ALLOWED_TYPES = [".mp4", ".mov", ".mkv"];

const CATEGORIES = [
  "general", "database", "networking", "backend", "frontend", "devops", "algorithms",
];

// ── Login gate: exchange admin credentials for a JWT ─────────────────────────

function LoginForm({ onToken }: { onToken: (access: string) => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/auth/token/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) throw new Error("bad credentials");
      const data = await res.json();
      localStorage.setItem("access_token", data.access);
      localStorage.setItem("refresh_token", data.refresh);
      onToken(data.access);
    } catch {
      setError("Login yoki parol noto'g'ri.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-sm space-y-4 rounded-xl border border-neutral-800 bg-neutral-900/50 p-6">
      <h2 className="text-lg font-semibold text-neutral-100">Admin login</h2>
      <input
        className="w-full rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 text-neutral-100"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        autoComplete="username"
      />
      <input
        className="w-full rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 text-neutral-100"
        type="password"
        placeholder="Parol"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        autoComplete="current-password"
      />
      {error && <p className="text-sm text-red-400">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-md bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
      >
        {loading ? "Kirilyapti…" : "Kirish"}
      </button>
    </form>
  );
}

// ── Uploader ─────────────────────────────────────────────────────────────────

function Uploader({ token, onLogout }: { token: string; onLogout: () => void }) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("general");
  const [done, setDone] = useState<string | null>(null);

  // Create the Uppy instance exactly once (lazy initializer).
  const [uppy] = useState(() =>
    new Uppy({
      autoProceed: false,
      restrictions: {
        maxNumberOfFiles: 1,
        allowedFileTypes: ALLOWED_TYPES,
        maxFileSize: MAX_FILE_SIZE,
      },
    }).use(Tus, {
      endpoint: `${API_URL}/upload/tus/`,
      chunkSize: CHUNK_SIZE,
      // Resumable: on reconnect @uppy/tus HEADs the stored upload URL to learn
      // the server-side offset, then continues from there — no config needed
      // beyond keeping the fingerprint (default) and sensible retry backoff.
      retryDelays: [0, 1000, 3000, 5000, 10000, 30000],
      removeFingerprintOnSuccess: true,
      headers: { Authorization: `Bearer ${token}` },
    }),
  );

  // Keep the JWT header current if the token changes.
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tus = uppy.getPlugin("Tus") as any;
    tus?.setOptions({ headers: { Authorization: `Bearer ${token}` } });
  }, [uppy, token]);

  // Push title/category into both the global meta and any already-selected file,
  // so Uppy sends them as tus Upload-Metadata even if typed after choosing a file.
  useEffect(() => {
    uppy.setMeta({ title, category });
    uppy.getFiles().forEach((f) => uppy.setFileMeta(f.id, { title, category }));
  }, [uppy, title, category]);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleComplete = (result: any) => {
      if (result.successful?.length) setDone(result.successful[0].name as string);
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleError = (_file: any, _error: any, response: any) => {
      if (response?.status === 401) onLogout(); // token expired → back to login
    };
    uppy.on("complete", handleComplete);
    uppy.on("upload-error", handleError);
    return () => {
      uppy.off("complete", handleComplete);
      uppy.off("upload-error", handleError);
    };
  }, [uppy, onLogout]);

  // Tear the instance down on unmount.
  useEffect(() => {
    return () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (uppy as any).destroy?.();
    };
  }, [uppy]);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-neutral-100">Video dars yuklash</h1>
        <button onClick={onLogout} className="text-sm text-neutral-400 hover:text-neutral-200">
          Chiqish
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="space-y-1">
          <span className="text-sm text-neutral-400">Sarlavha</span>
          <input
            className="w-full rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 text-neutral-100"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Masalan: Django REST — 1-dars"
          />
        </label>
        <label className="space-y-1">
          <span className="text-sm text-neutral-400">Kategoriya</span>
          <select
            className="w-full rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 text-neutral-100"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </label>
      </div>

      <Dashboard
        uppy={uppy}
        proudlyDisplayPoweredByUppy={false}
        height={360}
        note={`.mp4, .mov, .mkv — 6 GB gacha. ${CHUNK_SIZE / (1024 * 1024)} MB'lik bo'laklarda yuklanadi.`}
      />

      {done && (
        <p className="rounded-md bg-green-900/30 px-4 py-3 text-sm text-green-300">
          ✓ “{done}” to‘liq yuklandi va qayta ishlashga navbatga qo‘yildi (pending_processing).
        </p>
      )}
    </div>
  );
}

// ── Public component ─────────────────────────────────────────────────────────

export default function VideoUploader() {
  const [token, setToken] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setToken(localStorage.getItem("access_token"));
    setMounted(true);
  }, []);

  if (!mounted) return null; // avoid SSR/localStorage mismatch

  if (!token) return <LoginForm onToken={setToken} />;

  return (
    <Uploader
      token={token}
      onLogout={() => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        setToken(null);
      }}
    />
  );
}
