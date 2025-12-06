import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import type { Scan } from "@shared/schema";
import {
  Search,
  Filter,
  FileText,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronRight,
  Shield,
  MessageCircle,
  Smartphone,
  Instagram,
  TrendingUp,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDistanceToNow, format } from "date-fns";

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

function getSourceIcon(sourceType: string) {
  switch (sourceType) {
    case "whatsapp":
      return MessageCircle;
    case "sms":
      return Smartphone;
    case "instagram":
      return Instagram;
    case "trading_app":
      return TrendingUp;
    default:
      return FileText;
  }
}

export default function History() {
  const [searchQuery, setSearchQuery] = useState("");
  const [riskFilter, setRiskFilter] = useState("all");

  const { data: scans, isLoading } = useQuery<Scan[]>({
    queryKey: ["/api/scans"],
  });

  const filteredScans = scans?.filter((scan) => {
    const matchesSearch = searchQuery === "" ||
      scan.extractedText?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      scan.sourceType.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRisk = riskFilter === "all" || scan.riskLevel === riskFilter;
    
    return matchesSearch && matchesRisk;
  });

  const groupedScans = filteredScans?.reduce((acc, scan) => {
    const date = scan.createdAt ? format(new Date(scan.createdAt), "yyyy-MM-dd") : "Unknown";
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(scan);
    return acc;
  }, {} as Record<string, Scan[]>);

  return (
    <Layout>
      <div className="container mx-auto px-6 py-8 max-w-5xl">
        <div className="mb-8">
          <h1 className="font-heading text-3xl font-bold mb-2">Scan History</h1>
          <p className="text-muted-foreground">
            View and search all your previous scam detection analyses
          </p>
        </div>

        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by content or source..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  data-testid="input-search"
                />
              </div>
              <Tabs value={riskFilter} onValueChange={setRiskFilter}>
                <TabsList>
                  <TabsTrigger value="all" data-testid="filter-all">All</TabsTrigger>
                  <TabsTrigger value="high" data-testid="filter-high">High Risk</TabsTrigger>
                  <TabsTrigger value="medium" data-testid="filter-medium">Medium</TabsTrigger>
                  <TabsTrigger value="low" data-testid="filter-low">Low</TabsTrigger>
                  <TabsTrigger value="safe" data-testid="filter-safe">Safe</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Card key={i}>
                <CardContent className="py-4">
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-12 w-12 rounded" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-48 mb-2" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                    <Skeleton className="h-6 w-24" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredScans && filteredScans.length > 0 ? (
          <div className="space-y-8">
            {Object.entries(groupedScans || {}).map(([date, dateScans]) => (
              <div key={date}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-px flex-1 bg-border" />
                  <span className="text-sm font-medium text-muted-foreground">
                    {date === format(new Date(), "yyyy-MM-dd") ? "Today" :
                     date === format(new Date(Date.now() - 86400000), "yyyy-MM-dd") ? "Yesterday" :
                     format(new Date(date), "MMMM d, yyyy")}
                  </span>
                  <div className="h-px flex-1 bg-border" />
                </div>

                <div className="space-y-3">
                  {dateScans.map((scan) => {
                    const SourceIcon = getSourceIcon(scan.sourceType);
                    return (
                      <Card key={scan.id} className="hover-elevate cursor-pointer" data-testid={`scan-${scan.id}`}>
                        <CardContent className="py-4">
                          <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded bg-muted flex items-center justify-center text-muted-foreground flex-shrink-0">
                              <SourceIcon className="h-6 w-6" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="font-medium">
                                  {scan.sourceType.charAt(0).toUpperCase() + scan.sourceType.slice(1).replace("_", " ")} Screenshot
                                </p>
                                {getRiskBadge(scan.riskLevel)}
                              </div>
                              <p className="text-sm text-muted-foreground line-clamp-1">
                                {scan.extractedText?.substring(0, 100) || "No text extracted"}
                                {scan.extractedText && scan.extractedText.length > 100 ? "..." : ""}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {scan.createdAt && formatDistanceToNow(new Date(scan.createdAt), { addSuffix: true })}
                                <span className="mx-1">|</span>
                                Confidence: {Math.round((scan.confidenceScore || 0) * 100)}%
                              </p>
                            </div>
                            <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                          </div>
                          
                          {scan.redFlags && scan.redFlags.length > 0 && (
                            <div className="mt-3 pt-3 border-t flex flex-wrap gap-2">
                              {scan.redFlags.slice(0, 3).map((flag, i) => (
                                <Badge key={i} variant="outline" className="text-xs text-destructive border-destructive/30">
                                  {flag}
                                </Badge>
                              ))}
                              {scan.redFlags.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{scan.redFlags.length - 3} more
                                </Badge>
                              )}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-16 text-center">
              <Shield className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-heading text-xl font-semibold mb-2">
                {searchQuery || riskFilter !== "all" ? "No matching scans found" : "No scans yet"}
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                {searchQuery || riskFilter !== "all"
                  ? "Try adjusting your search or filters"
                  : "Upload your first screenshot to start detecting scams"}
              </p>
              {!searchQuery && riskFilter === "all" && (
                <Link href="/analyze">
                  <Button className="gap-2" data-testid="button-first-scan">
                    <FileText className="h-4 w-4" />
                    Analyze First Screenshot
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
