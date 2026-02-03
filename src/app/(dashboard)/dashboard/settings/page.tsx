"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, CreditCard, Key, Copy, RefreshCw } from "lucide-react";

export default function SettingsPage() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [team, setTeam] = useState<{
    name: string;
    plan: string;
    stripeCurrentPeriodEnd: string | null;
    apiKeys: { id: string; name: string; key: string; lastUsed: string | null }[];
  } | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const success = searchParams.get("success");
  const canceled = searchParams.get("canceled");

  useEffect(() => {
    fetchTeam();
  }, []);

  const fetchTeam = async () => {
    const res = await fetch("/api/team");
    if (res.ok) {
      const data = await res.json();
      setTeam(data);
    }
  };

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/billing/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID,
        }),
      });
      const { url } = await res.json();
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error("Upgrade error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateApiKey = async () => {
    const res = await fetch("/api/api-keys", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "API Key" }),
    });
    if (res.ok) {
      fetchTeam();
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account and billing
        </p>
      </div>

      {success && (
        <div className="bg-green-100 text-green-800 p-4 rounded-lg flex items-center gap-2">
          <Check className="h-5 w-5" />
          Successfully upgraded to Pro! Welcome aboard.
        </div>
      )}

      {canceled && (
        <div className="bg-yellow-100 text-yellow-800 p-4 rounded-lg">
          Upgrade canceled. You can upgrade anytime.
        </div>
      )}

      {/* Billing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Billing
          </CardTitle>
          <CardDescription>
            Manage your subscription and billing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 border rounded-lg mb-4">
            <div>
              <p className="font-medium">Current Plan</p>
              <p className="text-2xl font-bold text-primary">
                {team?.plan === "pro" ? "Pro" : "Free"}
              </p>
              {team?.plan === "pro" && team?.stripeCurrentPeriodEnd && (
                <p className="text-sm text-muted-foreground">
                  Renews on{" "}
                  {new Date(team.stripeCurrentPeriodEnd).toLocaleDateString()}
                </p>
              )}
            </div>
            {team?.plan !== "pro" && (
              <Button onClick={handleUpgrade} disabled={loading}>
                {loading ? "Loading..." : "Upgrade to Pro - $24/mo"}
              </Button>
            )}
          </div>

          {team?.plan !== "pro" && (
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Free Plan</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>✓ 10,000 events/month</li>
                  <li>✓ 1 project</li>
                  <li>✓ 1 team member</li>
                  <li>✓ 30-day retention</li>
                </ul>
              </div>
              <div className="p-4 border-2 border-primary rounded-lg">
                <h4 className="font-medium mb-2">Pro Plan - $24/mo</h4>
                <ul className="text-sm space-y-1">
                  <li className="text-primary">✓ 1,000,000 events/month</li>
                  <li className="text-primary">✓ 10 projects</li>
                  <li className="text-primary">✓ 5 team members</li>
                  <li className="text-primary">✓ Unlimited retention</li>
                  <li className="text-primary">✓ Custom funnels & reports</li>
                  <li className="text-primary">✓ Data export</li>
                </ul>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* API Keys */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                API Keys
              </CardTitle>
              <CardDescription>
                Manage API keys for server-side tracking
              </CardDescription>
            </div>
            <Button variant="outline" onClick={handleCreateApiKey}>
              Create Key
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {team?.apiKeys && team.apiKeys.length > 0 ? (
            <div className="space-y-2">
              {team.apiKeys.map((apiKey) => (
                <div
                  key={apiKey.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">{apiKey.name}</p>
                    <code className="text-xs text-muted-foreground">
                      {apiKey.key.slice(0, 12)}...
                    </code>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(apiKey.key, apiKey.id)}
                  >
                    {copied === apiKey.id ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-4">
              No API keys yet. Create one to use server-side tracking.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Account */}
      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>
            Your account settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Team Name</Label>
              <Input defaultValue={team?.name || ""} />
            </div>
            <Button variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
