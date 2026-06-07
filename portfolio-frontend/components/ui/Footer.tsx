import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full bg-black border-t border-[#1a1a1a]">
      <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="text-[11px] font-bold text-[#8c8c94] tracking-wider lowercase">
          thompsonshell
        </div>

        <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 text-xs font-bold text-[#8c8c94]">
          <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">GitHub</a>
          <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">LinkedIn</a>
          <a href="https://telegram.org" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Telegram</a>
          <a href="mailto:hello@thompson.dev" className="hover:text-white transition-colors">Email</a>
        </div>

        <div className="text-[10px] font-medium text-[#8c8c94]/50 uppercase tracking-wider">
          &copy;{new Date().getFullYear()} &middot; Stack
        </div>
      </div>
    </footer>
  );
}
