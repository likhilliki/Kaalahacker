import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { TrustBadges } from "@/components/TrustBadges";
import { useLocation } from "wouter";
import { Shield, Zap, Lock, TrendingUp, MessageSquare, FileSearch, ArrowRight, CheckCircle } from "lucide-react";

export default function Landing() {
  const [, setLocation] = useLocation();

  const features = [
    {
      icon: Shield,
      title: "AI-Powered Detection",
      description: "Advanced machine learning algorithms analyze messages and images for scam indicators in real-time"
    },
    {
      icon: Zap,
      title: "Instant Analysis",
      description: "Get results in seconds. Upload screenshots from WhatsApp, SMS, Instagram, or trading apps"
    },
    {
      icon: Lock,
      title: "Secure & Private",
      description: "Your data is encrypted and protected. We prioritize your privacy and security"
    },
    {
      icon: TrendingUp,
      title: "Financial Scam Focus",
      description: "Specialized in detecting investment frauds, trading scams, and financial phishing attempts"
    },
    {
      icon: MessageSquare,
      title: "Education Bot",
      description: "Learn about common scam tactics with our AI-powered educational chatbot Kaala"
    },
    {
      icon: FileSearch,
      title: "Detailed Reports",
      description: "Receive comprehensive analysis reports with risk levels and recommended actions"
    }
  ];

  const stats = [
    { value: "10K+", label: "Scans Performed" },
    { value: "95%", label: "Detection Accuracy" },
    { value: "500+", label: "Scams Prevented" },
    { value: "24/7", label: "Protection" }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-orange-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-6 max-w-7xl flex items-center justify-between gap-4 h-16">
          <Logo size="md" />
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Button variant="ghost" onClick={() => setLocation("/auth")}>
              Sign In
            </Button>
            <Button onClick={() => setLocation("/auth")}>
              Get Started
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 px-6">
          <div className="container mx-auto max-w-7xl">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6">
                  <Shield className="h-4 w-4" />
                  <span className="text-sm font-medium">SEBI-Compliant Protection</span>
                </div>
                <h1 className="font-heading text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-orange-500 to-primary bg-clip-text text-transparent">
                  Protect Yourself from Financial Scams
                </h1>
                <p className="text-xl text-muted-foreground mb-8 max-w-2xl">
                  AI-powered scam detection for WhatsApp, SMS, Instagram, and trading platforms.
                  Get instant analysis and stay safe from financial frauds.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Button size="lg" className="gap-2 text-lg px-8" onClick={() => setLocation("/auth")}>
                    Start Free Analysis
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                  <Button size="lg" variant="outline" className="text-lg px-8" onClick={() => setLocation("/auth")}>
                    Sign In
                  </Button>
                </div>
                <div className="mt-8">
                  <TrustBadges />
                </div>
              </div>

              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-orange-500/20 blur-3xl rounded-full"></div>
                <Card className="relative overflow-hidden border-2">
                  <CardContent className="p-8">
                    <div className="space-y-6">
                      <div className="flex items-center gap-3 p-4 bg-destructive/10 rounded-lg border border-destructive/20">
                        <div className="h-12 w-12 rounded-full bg-destructive/20 flex items-center justify-center">
                          <Shield className="h-6 w-6 text-destructive" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-sm">High Risk Detected</p>
                          <p className="text-xs text-muted-foreground">Potential investment scam</p>
                        </div>
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-muted rounded-lg">
                          <p className="text-2xl font-bold text-primary">95%</p>
                          <p className="text-xs text-muted-foreground">Accuracy Rate</p>
                        </div>
                        <div className="p-4 bg-muted rounded-lg">
                          <p className="text-2xl font-bold text-orange-500">&lt;5s</p>
                          <p className="text-xs text-muted-foreground">Analysis Time</p>
                        </div>
                      </div>

                      <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <p className="font-semibold text-sm">Protected</p>
                        </div>
                        <p className="text-xs text-muted-foreground">500+ users saved from scams today</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 px-6 bg-background/50 backdrop-blur">
          <div className="container mx-auto max-w-7xl">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <p className="text-4xl font-bold text-primary mb-2">{stat.value}</p>
                  <p className="text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-6">
          <div className="container mx-auto max-w-7xl">
            <div className="text-center mb-16">
              <h2 className="font-heading text-4xl font-bold mb-4">
                Why Choose Scam Shield AI?
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Comprehensive protection powered by advanced AI technology
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <Card key={index} className="hover-elevate transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-heading text-xl font-semibold mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20 px-6 bg-muted/30">
          <div className="container mx-auto max-w-7xl">
            <div className="text-center mb-16">
              <h2 className="font-heading text-4xl font-bold mb-4">
                How It Works
              </h2>
              <p className="text-xl text-muted-foreground">
                Get protected in three simple steps
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="h-16 w-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  1
                </div>
                <h3 className="font-heading text-xl font-semibold mb-2">Upload Screenshot</h3>
                <p className="text-muted-foreground">
                  Upload suspicious messages from WhatsApp, SMS, Instagram, or trading apps
                </p>
              </div>

              <div className="text-center">
                <div className="h-16 w-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  2
                </div>
                <h3 className="font-heading text-xl font-semibold mb-2">AI Analysis</h3>
                <p className="text-muted-foreground">
                  Our AI scans for scam indicators, fake promises, and suspicious patterns
                </p>
              </div>

              <div className="text-center">
                <div className="h-16 w-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  3
                </div>
                <h3 className="font-heading text-xl font-semibold mb-2">Get Protected</h3>
                <p className="text-muted-foreground">
                  Receive instant risk assessment and recommended actions to stay safe
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-6">
          <div className="container mx-auto max-w-4xl">
            <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-orange-500/5">
              <CardContent className="p-12 text-center">
                <Shield className="h-16 w-16 text-primary mx-auto mb-6" />
                <h2 className="font-heading text-3xl font-bold mb-4">
                  Ready to Protect Yourself?
                </h2>
                <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                  Join thousands of users who trust Scam Shield AI to detect financial scams
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" className="text-lg px-8" onClick={() => setLocation("/auth")}>
                    Get Started Free
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/30 py-8 px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Logo size="sm" />
              <p className="text-sm text-muted-foreground">© 2024 Scam Shield AI. All rights reserved.</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Shield className="h-4 w-4 text-green-600" />
              <span>SEBI-Compliant & Secure</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}