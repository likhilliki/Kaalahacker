import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import type { ScamReport, Scan } from "@shared/schema";
import {
  FileText,
  ExternalLink,
  Copy,
  CheckCircle,
  Clock,
  AlertTriangle,
  Shield,
  Send,
  Download,
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function getStatusBadge(status: string) {
  switch (status) {
    case "submitted":
      return <Badge className="gap-1 bg-green-500 hover:bg-green-600"><CheckCircle className="h-3 w-3" />Submitted</Badge>;
    case "resolved":
      return <Badge variant="secondary" className="gap-1"><CheckCircle className="h-3 w-3" />Resolved</Badge>;
    default:
      return <Badge variant="outline" className="gap-1"><Clock className="h-3 w-3" />Pending</Badge>;
  }
}

export default function Reports() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [selectedPortal, setSelectedPortal] = useState<string>("chakshu");
  const [reportDescription, setReportDescription] = useState("");
  const [selectedScanId, setSelectedScanId] = useState<string | null>(null);

  const { data: reports, isLoading: reportsLoading } = useQuery<ScamReport[]>({
    queryKey: ["/api/reports"],
  });

  const { data: scans } = useQuery<Scan[]>({
    queryKey: ["/api/scans"],
  });

  const highRiskScans = scans?.filter((scan) => 
    scan.riskLevel === "high" || scan.riskLevel === "medium"
  );

  const createReportMutation = useMutation({
    mutationFn: async (data: { scanId?: string; portal: string; description: string }) => {
      return apiRequest("POST", "/api/reports", data);
    },
    onSuccess: () => {
      toast({
        title: "Report Created",
        description: "Your scam report has been saved. You can now submit it to the portal.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/reports"] });
      setReportDescription("");
      setSelectedScanId(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create report",
        variant: "destructive",
      });
    },
  });

  const generateDescription = (scan: Scan) => {
    const redFlags = scan.redFlags?.join(", ") || "suspicious content";
    return `I would like to report a suspected financial scam received via ${scan.sourceType.replace("_", " ")}.

Details:
- Date detected: ${scan.createdAt ? format(new Date(scan.createdAt), "PPP") : "Unknown"}
- Risk level: ${scan.riskLevel.toUpperCase()}
- Red flags identified: ${redFlags}

Extracted content from the suspicious message:
"${scan.extractedText?.substring(0, 500) || "Content unavailable"}${scan.extractedText && scan.extractedText.length > 500 ? "..." : ""}"

Analysis:
${scan.aiExplanation || "AI analysis identified this as potentially fraudulent content."}

This report was generated using Kaala.hacker scam detection platform.`;
  };

  const handleScanSelect = (scanId: string) => {
    setSelectedScanId(scanId);
    const scan = scans?.find((s) => s.id === scanId);
    if (scan) {
      setReportDescription(generateDescription(scan));
    }
  };

  const handleSubmitReport = () => {
    if (!reportDescription.trim()) {
      toast({
        title: "Description Required",
        description: "Please enter a description for your report",
        variant: "destructive",
      });
      return;
    }

    createReportMutation.mutate({
      scanId: selectedScanId || undefined,
      portal: selectedPortal,
      description: reportDescription,
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Report description copied to clipboard",
    });
  };

  const getPortalUrl = (portal: string) => {
    switch (portal) {
      case "chakshu":
        return "https://sancharsaathi.gov.in/sfc/Home/sfc-complaint.jsp";
      case "cybercrime":
        return "https://cybercrime.gov.in/";
      default:
        return "#";
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-6 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="font-heading text-3xl font-bold mb-2">Scam Reports</h1>
          <p className="text-muted-foreground">
            Create and manage reports to submit to official portals
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="font-heading text-xl">Create New Report</CardTitle>
                <CardDescription>
                  Generate a pre-filled complaint to submit to Chakshu or Cybercrime portal
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Select Portal</label>
                  <Select value={selectedPortal} onValueChange={setSelectedPortal}>
                    <SelectTrigger data-testid="select-portal">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="chakshu">
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4" />
                          Chakshu (TRAI)
                        </div>
                      </SelectItem>
                      <SelectItem value="cybercrime">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4" />
                          Cybercrime.gov.in
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Link to Scan (Optional)</label>
                  <Select value={selectedScanId || ""} onValueChange={handleScanSelect}>
                    <SelectTrigger data-testid="select-scan">
                      <SelectValue placeholder="Select a detected scam..." />
                    </SelectTrigger>
                    <SelectContent>
                      {highRiskScans?.map((scan) => (
                        <SelectItem key={scan.id} value={scan.id}>
                          <div className="flex items-center gap-2">
                            <span className={`h-2 w-2 rounded-full ${
                              scan.riskLevel === "high" ? "bg-destructive" : "bg-orange-500"
                            }`} />
                            {scan.sourceType.replace("_", " ")} - {scan.createdAt && format(new Date(scan.createdAt), "PP")}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium">Report Description</label>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1 h-7"
                      onClick={() => copyToClipboard(reportDescription)}
                      disabled={!reportDescription}
                      data-testid="button-copy-description"
                    >
                      <Copy className="h-3 w-3" />
                      Copy
                    </Button>
                  </div>
                  <Textarea
                    value={reportDescription}
                    onChange={(e) => setReportDescription(e.target.value)}
                    placeholder="Describe the scam or select a scan above to auto-generate..."
                    className="min-h-[200px] resize-none"
                    data-testid="textarea-description"
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Button
                    className="gap-2 flex-1"
                    onClick={handleSubmitReport}
                    disabled={createReportMutation.isPending || !reportDescription.trim()}
                    data-testid="button-save-report"
                  >
                    <Send className="h-4 w-4" />
                    Save Report
                  </Button>
                  <Button
                    variant="outline"
                    className="gap-2"
                    asChild
                    data-testid="button-open-portal"
                  >
                    <a href={getPortalUrl(selectedPortal)} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4" />
                      Open {selectedPortal === "chakshu" ? "Chakshu" : "Cybercrime"} Portal
                    </a>
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground text-center pt-2">
                  Copy the description and paste it into the official portal's complaint form
                </p>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle className="font-heading text-xl">Your Reports</CardTitle>
                <CardDescription>
                  Track the status of your submitted reports
                </CardDescription>
              </CardHeader>
              <CardContent>
                {reportsLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="flex items-start gap-4 p-3 rounded-lg border">
                        <Skeleton className="h-10 w-10 rounded" />
                        <div className="flex-1">
                          <Skeleton className="h-4 w-32 mb-2" />
                          <Skeleton className="h-3 w-full" />
                          <Skeleton className="h-3 w-24 mt-2" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : reports && reports.length > 0 ? (
                  <div className="space-y-4">
                    {reports.map((report) => (
                      <div
                        key={report.id}
                        className="p-4 rounded-lg border hover-elevate"
                        data-testid={`report-${report.id}`}
                      >
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div className="flex items-center gap-2">
                            {report.portal === "chakshu" ? (
                              <Shield className="h-5 w-5 text-primary" />
                            ) : (
                              <AlertTriangle className="h-5 w-5 text-orange-500" />
                            )}
                            <span className="font-medium capitalize">
                              {report.portal === "chakshu" ? "Chakshu (TRAI)" : "Cybercrime.gov.in"}
                            </span>
                          </div>
                          {getStatusBadge(report.status || "pending")}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                          {report.description.substring(0, 150)}...
                        </p>
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {report.createdAt && formatDistanceToNow(new Date(report.createdAt), { addSuffix: true })}
                          </p>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="gap-1 h-7"
                            onClick={() => copyToClipboard(report.description)}
                            data-testid={`button-copy-report-${report.id}`}
                          >
                            <Copy className="h-3 w-3" />
                            Copy
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No reports created yet</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Create a report to track your submissions
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="font-heading text-lg">Important Links</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <a
                  href="https://sancharsaathi.gov.in/sfc/Home/sfc-complaint.jsp"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-lg border hover-elevate"
                >
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium text-sm">Chakshu Portal</p>
                      <p className="text-xs text-muted-foreground">Report telecom fraud</p>
                    </div>
                  </div>
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                </a>
                <a
                  href="https://cybercrime.gov.in/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-lg border hover-elevate"
                >
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 text-orange-500" />
                    <div>
                      <p className="font-medium text-sm">Cybercrime.gov.in</p>
                      <p className="text-xs text-muted-foreground">National cyber crime portal</p>
                    </div>
                  </div>
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                </a>
                <a
                  href="https://www.sebi.gov.in/sebiweb/home/HomeAction.do?doListingAll=yes&sid=1&ssid=7&smid=5"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-lg border hover-elevate"
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium text-sm">SEBI SCORES</p>
                      <p className="text-xs text-muted-foreground">Investor grievance redressal</p>
                    </div>
                  </div>
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                </a>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
