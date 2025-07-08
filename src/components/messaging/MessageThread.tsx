import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';
import {
  Send,
  Paperclip,
  Image,
  FileText,
  Download,
  Check,
  CheckCheck,
  Clock,
  AlertCircle,
  X,
  Phone,
  Video,
  MoreVertical,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface Message {
  id: string;
  text: string;
  timestamp: string;
  senderId: string;
  senderName: string;
  senderRole: 'PATIENT' | 'PROVIDER' | 'DOCTOR';
  readAt?: string;
  deliveredAt?: string;
  attachments?: {
    id: string;
    name: string;
    type: string;
    size: number;
    url: string;
  }[];
  replyTo?: string;
  isEncrypted: boolean;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
}

interface Conversation {
  id: string;
  participants: {
    id: string;
    name: string;
    role: 'PATIENT' | 'PROVIDER' | 'DOCTOR';
    avatar?: string;
  }[];
  subject?: string;
  lastMessage?: Message;
  unreadCount: number;
  isArchived: boolean;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
}

interface MessageThreadProps {
  conversation: Conversation;
  messages: Message[];
  onSendMessage: (text: string, attachments?: File[], replyTo?: string) => void;
  onMarkAsRead: (messageId: string) => void;
  onArchiveConversation: () => void;
  onStartCall: (type: 'audio' | 'video') => void;
}

const MessageThread: React.FC<MessageThreadProps> = ({
  conversation,
  messages,
  onSendMessage,
  onMarkAsRead,
  onArchiveConversation,
  onStartCall,
}) => {
  const { user } = useAuth();
  const [newMessage, setNewMessage] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [showAttachmentDialog, setShowAttachmentDialog] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const otherParticipant = conversation.participants.find(p => p.id !== user?.id);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (newMessage.trim() || attachments.length > 0) {
      onSendMessage(newMessage, attachments, replyingTo || undefined);
      setNewMessage('');
      setAttachments([]);
      setReplyingTo(null);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setAttachments(prev => [...prev, ...files]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const getMessageStatus = (message: Message) => {
    if (message.senderId === user?.id) {
      if (message.readAt) {
        return <CheckCheck className="h-3 w-3 text-blue-500" />;
      } else if (message.deliveredAt) {
        return <CheckCheck className="h-3 w-3 text-gray-400" />;
      } else {
        return <Check className="h-3 w-3 text-gray-400" />;
      }
    }
    return null;
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'high':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      case 'normal':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'low':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
      default:
        return '';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const MessageBubble: React.FC<{ message: Message }> = ({ message }) => {
    const isOwnMessage = message.senderId === user?.id;
    const replyToMessage = message.replyTo ? messages.find(m => m.id === message.replyTo) : null;

    return (
      <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-4`}>
        <div className={`max-w-[70%] ${isOwnMessage ? 'order-2' : 'order-1'}`}>
          {/* Reply indicator */}
          {replyToMessage && (
            <div className="mb-2 p-2 bg-muted rounded-lg border-l-4 border-primary">
              <div className="text-xs text-muted-foreground">
                Replying to {replyToMessage.senderName}
              </div>
              <div className="text-sm truncate">
                {replyToMessage.text.substring(0, 100)}...
              </div>
            </div>
          )}

          <div
            className={`p-3 rounded-lg ${
              isOwnMessage
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-foreground'
            }`}
          >
            {/* Message header */}
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium">
                  {message.senderName}
                </span>
                {message.priority && message.priority !== 'normal' && (
                  <Badge className={`text-xs ${getPriorityColor(message.priority)}`}>
                    {message.priority}
                  </Badge>
                )}
                {message.isEncrypted && (
                  <div className="text-xs opacity-70">🔒</div>
                )}
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <MoreVertical className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setReplyingTo(message.id)}>
                    Reply
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onMarkAsRead(message.id)}>
                    Mark as Read
                  </DropdownMenuItem>
                  {isOwnMessage && (
                    <DropdownMenuItem className="text-red-600">
                      Delete
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Message text */}
            <div className="text-sm whitespace-pre-wrap">{message.text}</div>

            {/* Attachments */}
            {message.attachments && message.attachments.length > 0 && (
              <div className="mt-2 space-y-2">
                {message.attachments.map((attachment) => (
                  <div
                    key={attachment.id}
                    className="flex items-center justify-between p-2 bg-background/10 rounded"
                  >
                    <div className="flex items-center gap-2">
                      {attachment.type.startsWith('image/') ? (
                        <Image className="h-4 w-4" />
                      ) : (
                        <FileText className="h-4 w-4" />
                      )}
                      <div>
                        <div className="text-xs font-medium">{attachment.name}</div>
                        <div className="text-xs opacity-70">
                          {formatFileSize(attachment.size)}
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                      <Download className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Message footer */}
            <div className="flex items-center justify-between mt-2">
              <div className="text-xs opacity-70">
                {format(new Date(message.timestamp), 'h:mm a')}
              </div>
              <div className="flex items-center gap-1">
                {getMessageStatus(message)}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium">
              {otherParticipant?.name.charAt(0)}
            </span>
          </div>
          <div>
            <div className="font-semibold">{otherParticipant?.name}</div>
            <div className="text-sm text-muted-foreground">
              {otherParticipant?.role === 'PATIENT' ? 'Patient' : 'Healthcare Provider'}
            </div>
          </div>
          {conversation.priority && conversation.priority !== 'normal' && (
            <Badge className={getPriorityColor(conversation.priority)}>
              {conversation.priority}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => onStartCall('audio')}>
            <Phone className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onStartCall('video')}>
            <Video className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onArchiveConversation}>
                Archive Conversation
              </DropdownMenuItem>
              <DropdownMenuItem>
                Export Messages
              </DropdownMenuItem>
              <DropdownMenuItem className="text-red-600">
                Block User
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Reply indicator */}
      {replyingTo && (
        <div className="px-4 py-2 bg-muted border-t">
          <div className="flex items-center justify-between">
            <div className="text-sm">
              Replying to: {messages.find(m => m.id === replyingTo)?.text.substring(0, 50)}...
            </div>
            <Button variant="ghost" size="icon" onClick={() => setReplyingTo(null)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Attachments preview */}
      {attachments.length > 0 && (
        <div className="px-4 py-2 border-t">
          <div className="flex flex-wrap gap-2">
            {attachments.map((file, index) => (
              <div key={index} className="flex items-center gap-2 bg-muted p-2 rounded">
                <FileText className="h-4 w-4" />
                <span className="text-sm">{file.name}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => removeAttachment(index)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Message Input */}
      <div className="p-4 border-t">
        <div className="flex items-end gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
          >
            <Paperclip className="h-4 w-4" />
          </Button>
          <Textarea
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1 min-h-[40px] max-h-[120px]"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
          />
          <Button onClick={handleSendMessage} disabled={!newMessage.trim() && attachments.length === 0}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleFileSelect}
          accept="image/*,.pdf,.doc,.docx,.txt"
        />
      </div>
    </div>
  );
};

export default MessageThread;
