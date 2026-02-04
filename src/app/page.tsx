import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BarChart3, TrendingUp, Users, Zap, Shield, Download } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">VibeAnalytics</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="#features" className="text-muted-foreground hover:text-foreground">Features</Link>
            <Link href="#pricing" className="text-muted-foreground hover:text-foreground">Pricing</Link>
            <Link href="/login" className="text-muted-foreground hover:text-foreground">Login</Link>
            <Link href="/register">
              <Button>Get Started</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="container mx-auto px-4 py-24 text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm text-primary mb-6">
          <Zap className="h-4 w-4" />
          <span>Real-time analytics for modern teams</span>
        </div>
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
          Understand your users.<br />
          <span className="text-primary">Grow your product.</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
          Track events, analyze user behavior, build funnels, and create custom reports. 
          All in one powerful analytics platform.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/register">
            <Button size="lg" className="text-lg px-8">
              Start Free Trial
            </Button>
          </Link>
          <Link href="#features">
            <Button size="lg" variant="outline" className="text-lg px-8">
              See Features
            </Button>
          </Link>
        </div>
        <p className="text-sm text-muted-foreground mt-4">
          No credit card required · 10,000 events/month free
        </p>
      </section>

      {/* Features */}
      <section id="features" className="container mx-auto px-4 py-24">
        <h2 className="text-3xl font-bold text-center mb-4">Everything you need</h2>
        <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
          Powerful features to help you understand your users and make data-driven decisions.
        </p>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard
            icon={<BarChart3 className="h-8 w-8" />}
            title="Event Tracking"
            description="Track any event in your application with our simple SDK. Get instant insights into user behavior."
          />
          <FeatureCard
            icon={<TrendingUp className="h-8 w-8" />}
            title="User Funnels"
            description="Build conversion funnels to understand where users drop off and optimize your product flow."
          />
          <FeatureCard
            icon={<Zap className="h-8 w-8" />}
            title="Real-time Dashboards"
            description="See what's happening in your product right now with live updating dashboards."
          />
          <FeatureCard
            icon={<Users className="h-8 w-8" />}
            title="Team Sharing"
            description="Collaborate with your team. Share dashboards, reports, and insights with granular permissions."
          />
          <FeatureCard
            icon={<Download className="h-8 w-8" />}
            title="Data Export"
            description="Export your data anytime. Download as CSV, JSON, or connect via API for custom integrations."
          />
          <FeatureCard
            icon={<Shield className="h-8 w-8" />}
            title="Privacy First"
            description="Your data stays secure. We're GDPR compliant and never sell your data to third parties."
          />
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="container mx-auto px-4 py-24">
        <h2 className="text-3xl font-bold text-center mb-4">Simple pricing</h2>
        <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
          Start free, upgrade when you need more.
        </p>
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Plan */}
          <div className="rounded-xl border bg-card p-8">
            <h3 className="text-2xl font-bold mb-2">Free</h3>
            <p className="text-muted-foreground mb-4">Perfect for side projects</p>
            <div className="text-4xl font-bold mb-6">$0<span className="text-lg font-normal text-muted-foreground">/month</span></div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center gap-2">
                <span className="text-primary">✓</span> 10,000 events/month
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary">✓</span> 1 project
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary">✓</span> 1 team member
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary">✓</span> 30-day data retention
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary">✓</span> Basic reports
              </li>
            </ul>
            <Link href="/register">
              <Button variant="outline" className="w-full">Get Started</Button>
            </Link>
          </div>
          {/* Pro Plan */}
          <div className="rounded-xl border-2 border-primary bg-card p-8 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
              Most Popular
            </div>
            <h3 className="text-2xl font-bold mb-2">Pro</h3>
            <p className="text-muted-foreground mb-4">For growing teams</p>
            <div className="text-4xl font-bold mb-6">$24<span className="text-lg font-normal text-muted-foreground">/month</span></div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center gap-2">
                <span className="text-primary">✓</span> 1,000,000 events/month
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary">✓</span> 10 projects
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary">✓</span> 5 team members
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary">✓</span> Unlimited data retention
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary">✓</span> Custom reports & funnels
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary">✓</span> Data export (CSV, JSON, API)
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary">✓</span> Priority support
              </li>
            </ul>
            <Link href="/register?plan=pro">
              <Button className="w-full">Start Free Trial</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-24">
        <div className="rounded-2xl bg-primary p-12 text-center text-primary-foreground">
          <h2 className="text-3xl font-bold mb-4">Ready to grow your product?</h2>
          <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
            Join thousands of teams using VibeAnalytics to understand their users and make better decisions.
          </p>
          <Link href="/register">
            <Button size="lg" variant="secondary" className="text-lg px-8">
              Get Started for Free
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-primary" />
              <span className="font-bold">VibeAnalytics</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2026 VibeAnalytics powered by{" "}
              <a href="https://vibecaas.com/" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                VibeCaaS.com
              </a>{" "}
              a division of{" "}
              <a href="https://neuralquantum.ai/" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                NeuralQuantum.ai LLC
              </a>
              . All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="rounded-xl border bg-card p-6 hover:shadow-lg transition-shadow">
      <div className="text-primary mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}
