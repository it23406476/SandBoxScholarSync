import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4 animate-fade-in">
      {/* Small Badge */}
      <div className="inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium bg-secondary text-secondary-foreground mb-8">
        🚀 ScholarSync is now live for IT3040
      </div>

      {/* Main Headline */}
      <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
        Intelligent Academic <br className="hidden md:block" />
        <span className="text-gradient">Knowledge Management</span>
      </h1>

      {/* Subtitle */}
      <p className="max-w-[600px] text-lg text-muted-foreground mb-10">
        Stop waiting for emails. Ask questions, find lecturer-verified answers, and share knowledge
        with your peers in real-time.
      </p>

      {/* Call to Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Link href="/qna">
          <Button size="lg" className="w-full sm:w-auto gradient-primary text-white border-0">
            Explore Q&A Hub
          </Button>
        </Link>
        <Link href="/forum">
          <Button size="lg" variant="outline" className="w-full sm:w-auto">
            Join the Community
          </Button>
        </Link>
      </div>

      {/* Feature Stats (Just for visual tech-lead points) */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-8 mt-20 pt-10 border-t w-full max-w-3xl">
        <div className="flex flex-col items-center">
          <h3 className="text-3xl font-bold text-foreground">0</h3>
          <p className="text-sm text-muted-foreground">Duplicate Questions</p>
        </div>
        <div className="flex flex-col items-center">
          <h3 className="text-3xl font-bold text-foreground">24/7</h3>
          <p className="text-sm text-muted-foreground">Smart Search</p>
        </div>
        <div className="flex flex-col items-center col-span-2 md:col-span-1">
          <h3 className="text-3xl font-bold text-foreground">100%</h3>
          <p className="text-sm text-muted-foreground">Peer Verified</p>
        </div>
      </div>
    </div>
  );
}
