import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="max-w-2xl text-center">
        <div className="w-20 h-20 rounded-full bg-deadbot-accent mx-auto mb-8 flex items-center justify-center">
          <span className="text-3xl font-bold text-white">D</span>
        </div>

        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
          Deadbot
        </h1>

        <p className="text-xl text-deadbot-muted mb-2">
          Cognitive Identity Simulation Platform
        </p>

        <p className="text-deadbot-muted mb-10 max-w-lg mx-auto">
          Build a persistent cognitive profile through conversation.
          Preserve reasoning patterns, values, emotions, and speech style
          to create a conversational identity that endures.
        </p>

        <div className="flex gap-4 justify-center">
          <Link
            href="/auth/register"
            className="px-8 py-3 bg-deadbot-accent hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
          >
            Get Started
          </Link>
          <Link
            href="/auth/login"
            className="px-8 py-3 bg-deadbot-card border border-deadbot-border hover:border-deadbot-accent/50 text-deadbot-text rounded-lg font-medium transition-colors"
          >
            Sign In
          </Link>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="bg-deadbot-card border border-deadbot-border rounded-xl p-5">
            <h3 className="font-semibold mb-2 text-purple-300">Cognitive Enrollment</h3>
            <p className="text-sm text-deadbot-muted">
              Build your cognitive fingerprint through guided conversations that map your reasoning, values, and emotional patterns.
            </p>
          </div>
          <div className="bg-deadbot-card border border-deadbot-border rounded-xl p-5">
            <h3 className="font-semibold mb-2 text-purple-300">Persistent Identity</h3>
            <p className="text-sm text-deadbot-muted">
              The profile learns and evolves with every interaction, maintaining contradictions and growth over time.
            </p>
          </div>
          <div className="bg-deadbot-card border border-deadbot-border rounded-xl p-5">
            <h3 className="font-semibold mb-2 text-purple-300">Voice & Avatar</h3>
            <p className="text-sm text-deadbot-muted">
              Capture voice samples and customize avatars with skins, moods, and accessories for an immersive experience.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
