import { Link } from 'react-router-dom';
import { ArrowLeft, MessageSquare } from 'lucide-react';
import { ChatBox } from '@/components/chat/ChatBox';

export default function ChatPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <Link 
            to="/dashboard" 
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali ke Dashboard
          </Link>
        </div>
        
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="hero-gradient p-2 rounded-lg">
              <MessageSquare className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">Chat</h1>
          </div>
          <p className="text-muted-foreground">
            Berbual dengan AI assistant anda
          </p>
        </div>

        <ChatBox />
      </div>
    </div>
  );
}