import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import type { Scan, Notification } from "@shared/schema";
import {
  Upload,
  Shield,
  AlertTriangle,
  FileText,
  TrendingUp,
  Clock,
  ArrowRight,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

function getRiskBadge(riskLevel: string) {
  switch (riskLevel) {
    case "high":
      return <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" />High Risk</Badge>;
    case "medium":
      return <Badge className="gap-1 bg-orange-500 hover:bg-orange-600"><AlertCircle className="h-3 w-3" />Medium</Badge>;
    case "low":
      return <Badge variant="secondary" className="gap-1"><AlertTriangle className="h-3 w-3" />Low Risk</Badge>;
    default:
      return <Badge variant="outline" className="gap-1 text-green-600 border-green-600"><CheckCircle className="h-3 w-3" />Safe</Badge>;
  }
}

export default function Dashboard() {
  const { user } = useAuth();

  const { data: stats, isLoading: statsLoading } = useQuery<{
    totalScans: number;
    scamsDetected: number;
    reportsSubmitted: number;
    highRiskScans: number;
  }>({
    queryKey: ["/api/stats"],
  });

  const { data: recentScans, isLoading: scansLoading } = useQuery<Scan[]>({
    queryKey: ["/api/scans", { limit: 5 }],
  });

  const { data: notifications, isLoading: notificationsLoading } = useQuery<Notification[]>({
    queryKey: ["/api/notifications", { limit: 5 }],
  });

  return (
    <Layout>
      <div className="container mx-auto px-6 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="font-heading text-3xl font-bold mb-2">
            Welcome back, {user?.firstName || "User"}
          </h1>
          <p className="text-muted-foreground">
            Here's an overview of your scam detection activity
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsLoading ? (
            <>
              {[...Array(4)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="pt-6">
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-8 w-16" />
                  </CardContent>
                </Card>
              ))}
            </>
          ) : (
            <>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Total Scans</p>
                      <p className="text-3xl font-bold">{stats?.totalScans || 0}</p>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Shield className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Scams Detected</p>
                      <p className="text-3xl font-bold text-destructive">{stats?.scamsDetected || 0}</p>
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
                      <p className="text-3xl font-bold">{stats?.reportsSubmitted || 0}</p>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
                      <FileText className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">High Risk</p>
                      <p className="text-3xl font-bold text-orange-500">{stats?.highRiskScans || 0}</p>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-orange-500/10 flex items-center justify-center">
                      <TrendingUp className="h-6 w-6 text-orange-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-4 pb-4">
                <CardTitle className="font-heading text-xl">Quick Scan</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed rounded-lg p-12 text-center hover:border-primary/50 transition-colors">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Upload className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-heading text-lg font-semibold mb-2">Upload Screenshot</h3>
                  <p className="text-muted-foreground text-sm mb-6 max-w-md mx-auto">
                    Drag and drop a screenshot from WhatsApp, SMS, Instagram, or trading apps to analyze for scams
                  </p>
                  <Link href="/analyze">
                    <Button className="gap-2" data-testid="button-analyze-now">
                      Analyze Now
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader className="flex flex-row items-center justify-between gap-4 pb-4">
                <CardTitle className="font-heading text-xl">Recent Scans</CardTitle>
                <Link href="/history">
                  <Button variant="ghost" size="sm" className="gap-1">
                    View All
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {scansLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="flex items-center gap-4">
                        <Skeleton className="h-12 w-12 rounded" />
                        <div className="flex-1">
                          <Skeleton className="h-4 w-32 mb-2" />
                          <Skeleton className="h-3 w-48" />
                        </div>
                        <Skeleton className="h-6 w-20" />
                      </div>
                    ))}
                  </div>
                ) : recentScans && recentScans.length > 0 ? (
                  <div className="space-y-4">
                    {recentScans.map((scan) => (
                      <div
                        key={scan.id}
                        className="flex items-center gap-4 p-3 rounded-lg hover-elevate cursor-pointer"
                        data-testid={`scan-item-${scan.id}`}
                      >
                        <div className="h-12 w-12 rounded bg-muted flex items-center justify-center text-muted-foreground">
                          <FileText className="h-6 w-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">
                            {scan.sourceType.charAt(0).toUpperCase() + scan.sourceType.slice(1)} Screenshot
                          </p>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {scan.createdAt && formatDistanceToNow(new Date(scan.createdAt), { addSuffix: true })}
                          </p>
                        </div>
                        {getRiskBadge(scan.riskLevel)}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No scans yet. Upload your first screenshot!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="font-heading text-xl">Notifications</CardTitle>
              </CardHeader>
              <CardContent>
                {notificationsLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="flex gap-3">
                        <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
                        <div className="flex-1">
                          <Skeleton className="h-4 w-full mb-2" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : notifications && notifications.length > 0 ? (
                  <div className="space-y-4">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`flex gap-3 p-3 rounded-lg ${!notification.isRead ? "bg-primary/5" : ""}`}
                        data-testid={`notification-${notification.id}`}
                      >
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          notification.type === "high_risk" ? "bg-destructive/10 text-destructive" :
                          notification.type === "success" ? "bg-green-500/10 text-green-600" :
                          "bg-primary/10 text-primary"
                        }`}>
                          {notification.type === "high_risk" ? (
                            <AlertTriangle className="h-4 w-4" />
                          ) : notification.type === "success" ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : (
                            <Shield className="h-4 w-4" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{notification.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                            {notification.message}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {notification.createdAt && formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground text-sm">No new notifications</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader className="pb-4">
                <CardTitle className="font-heading text-xl">Need Help?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Link href="/chat">
                    <Button variant="outline" className="w-full justify-start gap-2" data-testid="button-education-bot">
                      <Shield className="h-4 w-4" />
                      Talk to Education Bot
                    </Button>
                  </Link>
                  <Button variant="outline" className="w-full justify-start gap-2 text-destructive" data-testid="button-report-scam">
                    <AlertTriangle className="h-4 w-4" />
                    Report a Scam
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
