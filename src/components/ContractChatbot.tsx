import { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, Loader2, Bot, User } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChatMessage, createContractChatSession, sendChatMessage } from '@/lib/geminiService';
import { AnalysisResult } from '@/lib/contractAnalyzer';
import { useToast } from '@/hooks/use-toast';
import { ChatSession } from '@google/generative-ai';
import { cn } from '@/lib/utils';

// Simple markdown-like formatter for chat messages
function formatMessage(text: string): string {
  return text
    // Convert *text* to <em>text</em> for italics
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    // Convert **text** to <strong>text</strong> for bold
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    // Convert bullet points
    .replace(/^[•\-]\s+(.+)$/gm, '<li>$1</li>')
    // Wrap consecutive list items in ul
    .replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');
}

interface ContractChatbotProps {
  contractText: string;
  analysisResult: AnalysisResult;
}

export function ContractChatbot({ contractText, analysisResult }: ContractChatbotProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatSession, setChatSession] = useState<ChatSession | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Initialize chat session
  useEffect(() => {
    try {
      const session = createContractChatSession(contractText, analysisResult);
      setChatSession(session);
      
      // Add welcome message
      setMessages([
        {
          role: 'assistant',
          content: "Hey there! 💅 I'm Lease-Uh, your sassy rental contract advisor, and I just finished reading your contract. Honey, I've got OPINIONS. I'm here to spill the tea on your rental agreement and help you navigate this whole situation.\n\nAsk me about:\n• What those sketchy clauses actually mean\n• Your next moves (because you've got options!)\n• Your rights as a BC tenant (spoiler: you have more than you think)\n• How to handle problematic landlords\n• Where to get backup when you need it\n\nSo... what's on your mind? ✨",
          timestamp: Date.now()
        }
      ]);
    } catch (error) {
      console.error('Failed to initialize chat:', error);
      toast({
        title: 'Chat Unavailable',
        description: 'Unable to initialize the chatbot. Please check your API configuration.',
        variant: 'destructive'
      });
    }
  }, [contractText, analysisResult, toast]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || !chatSession || isLoading) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: input.trim(),
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await sendChatMessage(chatSession, userMessage.content);
      
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response,
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      toast({
        title: 'Message Failed',
        description: 'Unable to get a response. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Suggested questions
  const suggestedQuestions = [
    "Okay so what's the tea on these red flags? ☕",
    "How do I negotiate without getting walked over?",
    "Can I actually get out of this lease?",
    "Where do I find backup if things get messy?"
  ];

  const handleSuggestedQuestion = (question: string) => {
    setInput(question);
  };

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-primary" />
          Chat with Lease-Uh
        </CardTitle>
        <CardDescription>
          Get sassy, personalized guidance on next steps and your tenant rights
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Chat Messages */}
        <ScrollArea ref={scrollAreaRef} className="h-[400px] pr-4">
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={cn(
                  'flex gap-3',
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                {message.role === 'assistant' && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                )}
                
                <div
                  className={cn(
                    'rounded-lg px-4 py-3 max-w-[80%]',
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  )}
                >
                  <div
                    className="text-sm whitespace-pre-wrap prose prose-sm max-w-none dark:prose-invert"
                    dangerouslySetInnerHTML={{ __html: formatMessage(message.content) }}
                  />
                </div>

                {message.role === 'user' && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                    <User className="w-4 h-4 text-primary-foreground" />
                  </div>
                )}
              </div>
            ))}
            
            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
                <div className="rounded-lg px-4 py-3 bg-muted">
                  <Loader2 className="w-4 h-4 animate-spin" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Suggested Questions (only show if no messages yet) */}
        {messages.length === 1 && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Suggested questions:</p>
            <div className="flex flex-wrap gap-2">
              {suggestedQuestions.map((question, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => handleSuggestedQuestion(question)}
                  className="text-xs"
                >
                  {question}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask a question about your contract..."
            disabled={isLoading || !chatSession}
            className="flex-1"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!input.trim() || isLoading || !chatSession}
            size="icon"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>

        {/* Disclaimer */}
        <p className="text-xs text-muted-foreground text-center">
          This chatbot provides general information only. For legal advice, consult a lawyer or the BC Residential Tenancy Branch.
        </p>
      </CardContent>
    </Card>
  );
}
