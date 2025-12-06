import { useState, useCallback } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Scan } from "@shared/schema";
import {
  Upload,
  Image as ImageIcon,
  X,
  Loader2,
  AlertTriangle,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
  Copy,
  ExternalLink,
  MessageCircle,
  Smartphone,
  Instagram,
  TrendingUp,
  Shield,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const sourceTypes = [
  { value: "whatsapp", label: "WhatsApp", icon: MessageCircle },
  { value: "sms", label: "SMS Message", icon: Smartphone },
  { value: "instagram", label: "Instagram", icon: Instagram },
  { value: "trading_app", label: "Trading App", icon: TrendingUp },
];

function getRiskDisplay(riskLevel: string) {
  switch (riskLevel) {
    case "high":
      return {
        badge: <Badge variant="destructive" className="gap-1 text-base px-4 py-1"><XCircle className="h-4 w-4" />High Risk - Likely Scam</Badge>,
        color: "text-destructive",
        bgColor: "bg-destructive/10",
        icon: XCircle,
      };
    case "medium":
      return {
        badge: <Badge className="gap-1 text-base px-4 py-1 bg-orange-500 hover:bg-orange-600"><AlertCircle className="h-4 w-4" />Medium Risk - Suspicious</Badge>,
        color: "text-orange-500",
        bgColor: "bg-orange-500/10",
        icon: AlertCircle,
      };
    case "low":
      return {
        badge: <Badge variant="secondary" className="gap-1 text-base px-4 py-1"><AlertTriangle className="h-4 w-4" />Low Risk - Be Cautious</Badge>,
        color: "text-yellow-600",
        bgColor: "bg-yellow-500/10",
        icon: AlertTriangle,
      };
    default:
      return {
        badge: <Badge variant="outline" className="gap-1 text-base px-4 py-1 text-green-600 border-green-600"><CheckCircle className="h-4 w-4" />Safe - No Issues Found</Badge>,
        color: "text-green-600",
        bgColor: "bg-green-500/10",
        icon: CheckCircle,
      };
  }
}

export default function Analyze() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [sourceType, setSourceType] = useState<string>("whatsapp");
  const [analysisResult, setAnalysisResult] = useState<Scan | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const analyzeMutation = useMutation({
    mutationFn: async (data: { imageBase64: string; sourceType: string }) => {
      return apiRequest("POST", "/api/analyze", data) as Promise<Scan>;
    },
    onSuccess: (data) => {
      setAnalysisResult(data);
      queryClient.invalidateQueries({ queryKey: ["/api/scans"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      
      if (data.riskLevel === "high") {
        toast({
          title: "High Risk Detected!",
          description: "This content appears to be a financial scam. Do not engage with the sender.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Analysis Complete",
          description: `Risk level: ${data.riskLevel}`,
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Analysis Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFile = (selectedFile: File) => {
    if (!selectedFile.type.startsWith("image/")) {
      toast({
        title: "Invalid File",
        description: "Please upload an image file (PNG, JPG, etc.)",
        variant: "destructive",
      });
      return;
    }

    setFile(selectedFile);
    setAnalysisResult(null);

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleAnalyze = () => {
    if (!file || !preview) return;

    // Extract base64 data from the data URL
    const base64Match = preview.match(/^data:image\/\w+;base64,(.+)$/);
    if (!base64Match) {
      toast({
        title: "Error",
        description: "Could not process image",
        variant: "destructive",
      });
      return;
    }

    analyzeMutation.mutate({
      imageBase64: base64Match[1],
      sourceType,
    });
  };

  const clearFile = () => {
    setFile(null);
    setPreview(null);
    setAnalysisResult(null);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Text copied to clipboard",
    });
  };

  const riskDisplay = analysisResult ? getRiskDisplay(analysisResult.riskLevel) : null;

  return (
    <Layout>
      <div className="container mx-auto px-6 py-8 max-w-5xl">
        <div className="mb-8">
          <h1 className="font-heading text-3xl font-bold mb-2">Analyze Screenshot</h1>
          <p className="text-muted-foreground">
            Upload a screenshot to check for financial scam indicators
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div>
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="font-heading text-xl">Upload Image</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <label className="text-sm font-medium mb-2 block">Source Type</label>
                  <Select value={sourceType} onValueChange={setSourceType}>
                    <SelectTrigger data-testid="select-source-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {sourceTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center gap-2">
                            <type.icon className="h-4 w-4" />
                            {type.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {!preview ? (
                  <div
                    className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors cursor-pointer ${
                      dragActive ? "border-primary bg-primary/5" : "hover:border-primary/50"
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById("file-input")?.click()}
                    data-testid="dropzone"
                  >
                    <input
                      id="file-input"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileInput}
                      data-testid="input-file"
                    />
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <Upload className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="font-heading text-lg font-semibold mb-2">
                      {dragActive ? "Drop image here" : "Drop screenshot here"}
                    </h3>
                    <p className="text-muted-foreground text-sm mb-4">
                      or click to browse files
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Supports PNG, JPG, JPEG, WebP
                    </p>
                  </div>
                ) : (
                  <div className="relative">
                    <img
                      src={preview}
                      alt="Preview"
                      className="w-full rounded-lg border"
                      data-testid="image-preview"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={clearFile}
                      data-testid="button-clear-image"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}

                {file && (
                  <div className="mt-4 flex items-center justify-between gap-4 p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-3 min-w-0">
                      <ImageIcon className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                      <span className="text-sm font-medium truncate">{file.name}</span>
                    </div>
                    <Button
                      onClick={handleAnalyze}
                      disabled={analyzeMutation.isPending}
                      className="gap-2 flex-shrink-0"
                      data-testid="button-analyze"
                    >
                      {analyzeMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Shield className="h-4 w-4" />
                          Analyze
                        </>
                      )}
                    </Button>
                  </div>
                )}

                {analyzeMutation.isPending && (
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Processing image...</span>
                      <span className="font-medium">Please wait</span>
                    </div>
                    <Progress value={66} className="h-2" />
                    <p className="text-xs text-muted-foreground text-center">
                      Extracting text and analyzing for scam patterns
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div>
            {analysisResult ? (
              <Card>
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between gap-4">
                    <CardTitle className="font-heading text-xl">Analysis Result</CardTitle>
                    {riskDisplay?.badge}
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className={`p-4 rounded-lg ${riskDisplay?.bgColor}`}>
                    <div className="flex items-start gap-3">
                      {riskDisplay && <riskDisplay.icon className={`h-6 w-6 ${riskDisplay.color} flex-shrink-0 mt-0.5`} />}
                      <div>
                        <p className={`font-semibold ${riskDisplay?.color}`}>
                          Confidence: {Math.round((analysisResult.confidenceScore || 0) * 100)}%
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {analysisResult.aiExplanation}
                        </p>
                      </div>
                    </div>
                  </div>

                  {analysisResult.redFlags && analysisResult.redFlags.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-destructive" />
                        Red Flags Detected
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {analysisResult.redFlags.map((flag, i) => (
                          <Badge key={i} variant="destructive" className="text-sm">
                            {flag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="extracted-text">
                      <AccordionTrigger className="text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          Extracted Text
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="relative">
                          <Textarea
                            value={analysisResult.extractedText || "No text extracted"}
                            readOnly
                            className="font-mono text-sm min-h-[120px] resize-none"
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-2 right-2"
                            onClick={() => copyToClipboard(analysisResult.extractedText || "")}
                            data-testid="button-copy-text"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="detailed-analysis">
                      <AccordionTrigger className="text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4" />
                          Detailed Analysis
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                          <p className="text-muted-foreground whitespace-pre-wrap">
                            {analysisResult.analysis || "No detailed analysis available"}
                          </p>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>

                  {(analysisResult.riskLevel === "high" || analysisResult.riskLevel === "medium") && (
                    <div className="pt-4 border-t space-y-3">
                      <h4 className="font-semibold">Report This Scam</h4>
                      <div className="grid sm:grid-cols-2 gap-3">
                        <Button
                          variant="outline"
                          className="gap-2 justify-start"
                          asChild
                          data-testid="button-report-chakshu"
                        >
                          <a href={`/reports/new?scanId=${analysisResult.id}&portal=chakshu`}>
                            <ExternalLink className="h-4 w-4" />
                            Report to Chakshu
                          </a>
                        </Button>
                        <Button
                          variant="outline"
                          className="gap-2 justify-start"
                          asChild
                          data-testid="button-report-cybercrime"
                        >
                          <a href={`/reports/new?scanId=${analysisResult.id}&portal=cybercrime`}>
                            <ExternalLink className="h-4 w-4" />
                            Report to Cybercrime
                          </a>
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card className="h-full">
                <CardContent className="flex flex-col items-center justify-center h-full py-16 text-center">
                  <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
                    <Shield className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <h3 className="font-heading text-xl font-semibold mb-2">
                    Upload to Analyze
                  </h3>
                  <p className="text-muted-foreground max-w-sm">
                    Upload a screenshot from WhatsApp, SMS, Instagram, or any trading app to check for scam indicators
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
