import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import type { Scan, ScamReport, User } from "@shared/schema";
import {
  Shield,
  Users,
  AlertTriangle,
  FileText,
  TrendingUp,
  BarChart3,
  Activity,
  Clock,
} from "lucide-react";
import { formatDistanceToNow, format, subDays } from "date-fns";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const RISK_COLORS = {
  high: "#ef4444",
  medium: "#f97316",
  low: "#eab308",
  safe: "#22c55e",
};

export default function Admin() {
  const { user, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && !user?.isAdmin) {
      toast({
        title: "Unauthorized",
        description: "You don't have permission to access this page",
        variant: "destructive",
      });
      setTimeout(() => setLocation("/"), 500);
    }
  }, [user, authLoading, setLocation, toast]);

  const { data: platformStats, isLoading: statsLoading } = useQuery<{
    totalUsers: number;
    totalScans: number;
    totalReports: number;
    scamsDetected: number;
    highRiskScans: number;
    activeUsersToday: number;
  }>({
    queryKey: ["/api/admin/stats"],
    enabled: !!user?.isAdmin,
  });

  const { data: recentScans, isLoading: scansLoading } = useQuery<Scan[]>({
    queryKey: ["/api/admin/scans", { limit: 10 }],
    enabled: !!user?.isAdmin,
  });

  const { data: recentReports, isLoading: reportsLoading } = useQuery<ScamReport[]>({
    queryKey: ["/api/admin/reports", { limit: 10 }],
    enabled: !!user?.isAdmin,
  });

  const { data: dailyStats } = useQuery<Array<{ date: string; scans: number; scams: number }>>({
    queryKey: ["/api/admin/daily-stats"],
    enabled: !!user?.isAdmin,
  });

  if (authLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-6 py-8 max-w-7xl">
          <Skeleton className="h-8 w-48 mb-8" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-8 w-16" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  if (!user?.isAdmin) {
    return null;
  }

  const riskDistribution = recentScans
    ? [
        { name: "High Risk", value: recentScans.filter((s) => s.riskLevel === "high").length, color: RISK_COLORS.high },
        { name: "Medium", value: recentScans.filter((s) => s.riskLevel === "medium").length, color: RISK_COLORS.medium },
        { name: "Low Risk", value: recentScans.filter((s) => s.riskLevel === "low").length, color: RISK_COLORS.low },
        { name: "Safe", value: recentScans.filter((s) => s.riskLevel === "safe").length, color: RISK_COLORS.safe },
      ]
    : [];

  const mockDailyStats = dailyStats || [...Array(7)].map((_, i) => ({
    date: format(subDays(new Date(), 6 - i), "MMM d"),
    scans: Math.floor(Math.random() * 100) + 20,
    scams: Math.floor(Math.random() * 30) + 5,
  }));

  return (
    <Layout>
      <div className="container mx-auto px-6 py-8 max-w-7xl">
        <div className="flex items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="font-heading text-3xl font-bold">Admin Dashboard</h1>
              <Badge variant="destructive">Admin</Badge>
            </div>
            <p className="text-muted-foreground">
              Monitor platform usage, scam detection statistics, and user reports
            </p>
          </div>
          <Button variant="outline" className="gap-2">
            <Activity className="h-4 w-4" />
            Export Report
          </Button>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsLoading ? (
            [...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-8 w-16" />
                </CardContent>
              </Card>
            ))
          ) : (
            <>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Total Users</p>
                      <p className="text-3xl font-bold">{platformStats?.totalUsers || 0}</p>
                      <p className="text-xs text-green-600 mt-1">
                        +{platformStats?.activeUsersToday || 0} active today
                      </p>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Total Scans</p>
                      <p className="text-3xl font-bold">{platformStats?.totalScans || 0}</p>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                      <Shield className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Scams Detected</p>
                      <p className="text-3xl font-bold text-destructive">{platformStats?.scamsDetected || 0}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {platformStats?.highRiskScans || 0} high risk
                      </p>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
                      <AlertTriangle className="h-6 w-6 text-destructive" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Reports Filed</p>
                      <p className="text-3xl font-bold">{platformStats?.totalReports || 0}</p>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
                      <FileText className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="font-heading text-xl flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Scan Activity (Last 7 Days)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={mockDailyStats}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="scans"
                      stroke="hsl(var(--primary))"
                      fill="hsl(var(--primary) / 0.2)"
                      name="Total Scans"
                    />
                    <Area
                      type="monotone"
                      dataKey="scams"
                      stroke="#ef4444"
                      fill="rgba(239, 68, 68, 0.2)"
                      name="Scams Detected"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-heading text-xl flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Risk Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={riskDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {riskDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-4">
                {riskDistribution.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-sm text-muted-foreground">{item.name}</span>
                    <span className="text-sm font-medium ml-auto">{item.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="font-heading text-xl">Recent Scans</CardTitle>
              <CardDescription>Latest scam detection analyses</CardDescription>
            </CardHeader>
            <CardContent>
              {scansLoading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : recentScans && recentScans.length > 0 ? (
                <div className="space-y-3">
                  {recentScans.slice(0, 5).map((scan) => (
                    <div
                      key={scan.id}
                      className="flex items-center justify-between gap-4 p-3 rounded-lg border"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {scan.sourceType.replace("_", " ")} Screenshot
                        </p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {scan.createdAt && formatDistanceToNow(new Date(scan.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                      <Badge
                        variant={scan.riskLevel === "high" ? "destructive" : scan.riskLevel === "medium" ? "default" : "secondary"}
                        style={scan.riskLevel === "medium" ? { backgroundColor: "#f97316" } : undefined}
                      >
                        {scan.riskLevel}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">No scans yet</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-heading text-xl">Recent Reports</CardTitle>
              <CardDescription>User-submitted scam reports</CardDescription>
            </CardHeader>
            <CardContent>
              {reportsLoading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : recentReports && recentReports.length > 0 ? (
                <div className="space-y-3">
                  {recentReports.slice(0, 5).map((report) => (
                    <div
                      key={report.id}
                      className="flex items-center justify-between gap-4 p-3 rounded-lg border"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm capitalize">
                          {report.portal === "chakshu" ? "Chakshu (TRAI)" : "Cybercrime.gov.in"}
                        </p>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {report.description.substring(0, 50)}...
                        </p>
                      </div>
                      <Badge variant={report.status === "submitted" ? "default" : "outline"}>
                        {report.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">No reports yet</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
