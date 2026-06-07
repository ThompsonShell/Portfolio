import Hero from "@/components/sections/Hero";
import FeaturedProjects from "@/components/sections/FeaturedProjects";
import RecentWriting from "@/components/sections/RecentWriting";
import Skills from "@/components/sections/Skills";

export default function HomePage() {
  return (
    <div className="max-w-5xl mx-auto border-x border-[#1a1a1a] min-h-screen bg-black">
      <Hero />
      <FeaturedProjects />
      <RecentWriting />
      <Skills />
    </div>
  );
}
