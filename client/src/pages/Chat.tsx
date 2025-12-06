import { useState, useRef, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { ChatMessage } from "@shared/schema";
import {
  Send,
  Bot,
  User,
  Loader2,
  Shield,
  AlertTriangle,
  BookOpen,
  Info,
  Sparkles,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const suggestedQuestions = [
  "What is SEBI and what does it regulate?",
  "How can I verify if a broker is registered?",
  "What are common signs of a stock market scam?",
  "What is the difference between NSE and BSE?",
  "How do pump and dump schemes work?",
  "What are my rights as an investor in India?",
];

export default function Chat() {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [message, setMessage] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: messages, isLoading } = useQuery<ChatMessage[]>({
    queryKey: ["/api/chat/messages"],
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      return apiRequest("POST", "/api/chat/messages", { content });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat/messages"] });
      setMessage("");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send message",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (!message.trim()) return;
    sendMessageMutation.mutate(message.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSuggestedQuestion = (question: string) => {
    setMessage(question);
    inputRef.current?.focus();
  };

  const getInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    return "U";
  };

  return (
    <Layout>
      <div className="container mx-auto px-6 py-8 max-w-4xl">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Bot className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="font-heading text-2xl font-bold">Stock Market Education Assistant</h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="gap-1 text-xs">
                  <Shield className="h-3 w-3" />
                  SEBI Compliant
                </Badge>
                <Badge variant="outline" className="gap-1 text-xs">
                  <Info className="h-3 w-3" />
                  3+ Month Old Data
                </Badge>
              </div>
            </div>
          </div>
        </div>

        <Card className="h-[calc(100vh-300px)] min-h-[500px] flex flex-col">
          <CardHeader className="border-b pb-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              <span>
                This assistant provides investor education only. Per SEBI regulations, all information is based on data at least 3 months old. We do not provide stock tips or investment advice.
              </span>
            </div>
          </CardHeader>

          <ScrollArea className="flex-1 p-6" ref={scrollRef}>
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : messages && messages.length > 0 ? (
              <div className="space-y-6">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                    data-testid={`message-${msg.id}`}
                  >
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarFallback className={msg.role === "assistant" ? "bg-primary/10 text-primary" : ""}>
                        {msg.role === "assistant" ? <Bot className="h-4 w-4" /> : getInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <div className={`flex flex-col max-w-[80%] ${msg.role === "user" ? "items-end" : ""}`}>
                      <div
                        className={`rounded-lg px-4 py-3 ${
                          msg.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      </div>
                      <span className="text-xs text-muted-foreground mt-1">
                        {msg.createdAt && formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                ))}
                
                {sendMessageMutation.isPending && (
                  <div className="flex gap-3">
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        <Bot className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="bg-muted rounded-lg px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm text-muted-foreground">Thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                  <Sparkles className="h-10 w-10 text-primary" />
                </div>
                <h3 className="font-heading text-xl font-semibold mb-2">
                  Ask me anything about Indian stock markets
                </h3>
                <p className="text-muted-foreground max-w-md mb-8">
                  I can help you understand SEBI regulations, trading basics, investor rights, and how to identify scams.
                </p>
                
                <div className="w-full max-w-lg">
                  <p className="text-sm font-medium mb-3 flex items-center gap-2 justify-center">
                    <BookOpen className="h-4 w-4" />
                    Suggested questions
                  </p>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {suggestedQuestions.map((question, i) => (
                      <Button
                        key={i}
                        variant="outline"
                        className="text-left justify-start h-auto py-2 px-3 text-sm"
                        onClick={() => handleSuggestedQuestion(question)}
                        data-testid={`suggested-question-${i}`}
                      >
                        {question}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </ScrollArea>

          <div className="border-t p-4">
            <div className="flex gap-3">
              <Input
                ref={inputRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about stock markets, SEBI, trading, or scam detection..."
                disabled={sendMessageMutation.isPending}
                className="flex-1"
                data-testid="input-chat-message"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!message.trim() || sendMessageMutation.isPending}
                className="gap-2"
                data-testid="button-send-message"
              >
                {sendMessageMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                Send
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </Layout>
  );
}
