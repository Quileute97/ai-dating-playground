
import React, { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

interface FakeUserChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    id: string;
    name: string;
    avatar: string;
    aiPrompt: string;
  } | null;
}

interface Message {
  id: string;
  sender: "admin" | "ai";
  content: string;
  timestamp: number;
}

const AI_REPLY_DELAY = 60 * 60 * 1000; // 1 giờ (ms) - DEMO có thể giảm xuống 1 phút để test

const DummyAIReply = (prompt: string) => {
  // Đơn giản hóa: dùng prompt tạo reply
  return `(${prompt.slice(0,40)}...) [AI tự động trả lời]`;
};

const FakeUserChatModal = ({ isOpen, onClose, user }: FakeUserChatModalProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [lastAdminReply, setLastAdminReply] = useState<number | null>(null);
  const aiTimeout = useRef<NodeJS.Timeout|null>(null);

  // reset khi mở modal mới
  useEffect(() => {
    if (isOpen && user) {
      setMessages([
        {
          id: "welcome",
          sender: "ai",
          content: `Xin chào Admin, bạn muốn hỏi gì với "${user.name}"?`,
          timestamp: Date.now(),
        }
      ]);
      setLastAdminReply(Date.now());
    }
    if (!isOpen) {
      if (aiTimeout.current) clearTimeout(aiTimeout.current);
    }
    // eslint-disable-next-line
  }, [isOpen, user]);

  // Kiểm tra nếu quá 1 giờ admin không trả lời thì AI sẽ trả lời
  useEffect(() => {
    if (!isOpen || !user) return;
    if (aiTimeout.current) clearTimeout(aiTimeout.current);

    if (messages.length === 0) return;

    // chỉ auto AI nếu last msg là của admin
    const lastMsg = messages[messages.length - 1];
    if (lastMsg.sender === "admin") {
      aiTimeout.current = setTimeout(() => {
        setMessages(prev => [
          ...prev,
          {
            id: Date.now() + "_ai",
            sender: "ai",
            content: DummyAIReply(user.aiPrompt),
            timestamp: Date.now()
          }
        ]);
      }, 60000); // Giảm còn 1 phút để test trên UI, PROD thì AI_REPLY_DELAY
    }
    // eslint-disable-next-line
  }, [messages, isOpen, user]);

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages(prev => [
      ...prev,
      {
        id: Date.now() + "_admin",
        sender: "admin",
        content: input.trim(),
        timestamp: Date.now()
      }
    ]);
    setInput("");
    setLastAdminReply(Date.now());
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            Nhắn tin với <span className="text-pink-600">{user?.name}</span>
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col h-[50vh]">
          <ScrollArea className="flex-1 mb-3">
            <div className="flex flex-col gap-3 pr-2">
              {messages.map(msg => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === "admin" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={
                      msg.sender === "admin"
                        ? "bg-purple-500 text-white rounded-2xl px-4 py-2 max-w-sm"
                        : "bg-gray-100 text-gray-800 rounded-2xl px-4 py-2 max-w-sm"
                    }
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
          <div className="flex gap-2 mt-auto">
            <Input
              value={input}
              onChange={e => setInput(e.target.value)}
              className="flex-1"
              placeholder="Nhập tin nhắn..."
              onKeyDown={(e) => { if (e.key === "Enter") handleSend(); }}
            />
            <Button onClick={handleSend} disabled={!input.trim()}>Gửi</Button>
          </div>
        </div>
        <div className="text-xs text-gray-400 pt-1">
          Nếu admin không trả lời sau 1 phút, AI sẽ tự động phản hồi cho demo (bình thường là 1 giờ)
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FakeUserChatModal;

