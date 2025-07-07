import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';
import {
  MessageSquare,
  Search,
  Plus,
  User,
  Clock,
  Phone,
  Video,
  MoreVertical,
  Archive,
  Star,
  AlertCircle,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { EmptyState } from '@/components/LoadingStates';
import MessageThread from '@/components/messaging/MessageThread';

const Messages: React.FC = () => {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data - in real app this would come from API
  const conversations = [
    {
      id: '1',
      participants: [
        { id: user?.id || 'patient-1', name: user?.name || 'Patient', role: 'PATIENT' as const },
        { id: 'provider-1', name: 'Dr. Sarah Johnson', role: 'PROVIDER' as const },
      ],
      subject: 'Cardiology Follow-up',
      lastMessage: {
        id: 'msg-3',
        text: 'Your test results look good. Please continue with the current medication.',
        timestamp: '2025-07-07T14:30:00Z',
        senderId: 'provider-1',
        senderName: 'Dr. Sarah Johnson',
        senderRole: 'PROVIDER' as const,
        isEncrypted: true,
        readAt: undefined,
        deliveredAt: '2025-07-07T14:30:05Z',
      },
      unreadCount: 2,
      isArchived: false,
      priority: 'normal' as const,
    },
    {
      id: '2',
      participants: [
        { id: user?.id || 'patient-1', name: user?.name || 'Patient', role: 'PATIENT' as const },
        { id: 'provider-2', name: 'Dr. Michael Chen', role: 'PROVIDER' as const },
      ],
      subject: 'General Health Check',
      lastMessage: {
        id: 'msg-6',
        text: 'Thank you for the update. I will review and get back to you.',
        timestamp: '2025-07-06T10:15:00Z',
        senderId: user?.id || 'patient-1',
        senderName: user?.name || 'Patient',
        senderRole: 'PATIENT' as const,
        isEncrypted: true,
        readAt: '2025-07-06T10:16:00Z',
        deliveredAt: '2025-07-06T10:15:05Z',
      },
      unreadCount: 0,
      isArchived: false,
      priority: 'normal' as const,
    },
  ];

  const messages = selectedConversation ? [
    {
      id: 'msg-1',
      text: 'Hello Dr. Johnson, I wanted to follow up on my recent appointment.',
      timestamp: '2025-07-07T09:00:00Z',
      senderId: user?.id || 'patient-1',
      senderName: user?.name || 'Patient',
      senderRole: 'PATIENT' as const,
      isEncrypted: true,
      readAt: '2025-07-07T09:01:00Z',
      deliveredAt: '2025-07-07T09:00:05Z',
    },
    {
      id: 'msg-2',
      text: 'Hello! Thank you for reaching out. I have reviewed your case.',
      timestamp: '2025-07-07T14:00:00Z',
      senderId: 'provider-1',
      senderName: 'Dr. Sarah Johnson',
      senderRole: 'PROVIDER' as const,
      isEncrypted: true,
      readAt: '2025-07-07T14:01:00Z',
      deliveredAt: '2025-07-07T14:00:05Z',
    },
    {
      id: 'msg-3',
      text: 'Your test results look good. Please continue with the current medication.',
      timestamp: '2025-07-07T14:30:00Z',
      senderId: 'provider-1',
      senderName: 'Dr. Sarah Johnson',
      senderRole: 'PROVIDER' as const,
      isEncrypted: true,
      readAt: undefined,
      deliveredAt: '2025-07-07T14:30:05Z',
      attachments: [
        {
          id: 'att-1',
          name: 'test_results.pdf',
          type: 'application/pdf',
          size: 245760,
          url: '/attachments/test_results.pdf',
        },
      ],
    },
  ] : [];

  const selectedConversationData = conversations.find(c => c.id === selectedConversation);

  const handleSendMessage = (text: string, attachments?: File[], replyTo?: string) => {
    console.log('Sending message:', { text, attachments, replyTo });
    // In real app, this would send the message via API
  };

  const handleMarkAsRead = (messageId: string) => {
    console.log('Marking message as read:', messageId);
    // In real app, this would mark the message as read via API
  };

  const handleArchiveConversation = () => {
    console.log('Archiving conversation:', selectedConversation);
    // In real app, this would archive the conversation via API
  };

  const handleStartCall = (type: 'audio' | 'video') => {
    console.log('Starting call:', type);
    // In real app, this would initiate a call
  };

  const otherParticipant = selectedConversationData?.participants.find(p => p.id !== user?.id);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      // In real app, send message via API
      console.log('Sending message:', newMessage);
      setNewMessage('');
    }
  };

  const ConversationList = () => (
    <div className="space-y-2">
      {conversations
        .filter(conv => {
          if (!searchTerm) return true;
          const otherParticipant = conv.participants.find(p => p.id !== user?.id);
          return otherParticipant?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                 conv.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                 conv.lastMessage?.text.toLowerCase().includes(searchTerm.toLowerCase());
        })
        .map((conversation) => {
          const otherParticipant = conversation.participants.find(p => p.id !== user?.id);
          return (
            <Card
              key={conversation.id}
              className={`cursor-pointer transition-colors hover:bg-accent ${
                selectedConversation === conversation.id ? 'bg-accent' : ''
              }`}
              onClick={() => setSelectedConversation(conversation.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="font-semibold truncate">
                        {otherParticipant?.name}
                      </div>
                    <div className="flex items-center gap-2">
                      {conversation.priority && conversation.priority !== 'normal' && (
                        <Badge variant="outline" className="text-xs">
                          {conversation.priority}
                        </Badge>
                      )}
                      {conversation.unreadCount > 0 && (
                        <Badge variant="default" className="text-xs">
                          {conversation.unreadCount}
                        </Badge>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(conversation.lastMessage?.timestamp || ''), 'MMM d')}
                      </span>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {conversation.subject || 'Healthcare Communication'}
                  </div>
                  <div className="text-sm text-muted-foreground truncate mt-1">
                    {conversation.lastMessage?.senderId === user?.id ? 'You: ' : ''}
                    {conversation.lastMessage?.text}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          );
        })}
    </div>
  );

  const MessageView = () => {
    if (!selectedConversationData) return null;

    return (
      <MessageThread
        conversation={selectedConversationData}
        messages={messages}
        onSendMessage={handleSendMessage}
        onMarkAsRead={handleMarkAsRead}
        onArchiveConversation={handleArchiveConversation}
        onStartCall={handleStartCall}
      />
    );
  };

  if (isMobile) {
    return (
      <div className="space-y-6">
        {!selectedConversation ? (
          <>
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">Messages</h1>
                <p className="text-muted-foreground">
                  Secure communication with your healthcare providers
                </p>
              </div>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Message
              </Button>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Conversations */}
            {conversations.length > 0 ? (
              <ConversationList />
            ) : (
              <EmptyState
                title="No Messages"
                message="You don't have any messages yet. Start a conversation with your healthcare provider."
                action={{
                  label: "Send First Message",
                  onClick: () => console.log('Start new conversation')
                }}
                icon={<MessageSquare className="h-12 w-12 text-muted-foreground" />}
              />
            )}
          </>
        ) : (
          <div className="h-[calc(100vh-200px)]">
            <Button 
              variant="ghost" 
              onClick={() => setSelectedConversation(null)}
              className="mb-4"
            >
              ← Back to Messages
            </Button>
            <Card className="h-full">
              <MessageView />
            </Card>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Messages</h1>
          <p className="text-muted-foreground">
            Secure communication with your healthcare providers
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Message
        </Button>
      </div>

      {/* Desktop Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-300px)]">
        {/* Conversations List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {conversations.length > 0 ? (
              <div className="p-4">
                <ConversationList />
              </div>
            ) : (
              <EmptyState
                title="No Messages"
                message="Start a conversation with your healthcare provider."
                icon={<MessageSquare className="h-8 w-8 text-muted-foreground" />}
              />
            )}
          </CardContent>
        </Card>

        {/* Message View */}
        <Card className="lg:col-span-2">
          {selectedConversation ? (
            <MessageView />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Select a conversation to start messaging</p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Messages;
