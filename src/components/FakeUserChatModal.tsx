import React, { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ImageIcon, VideoIcon, Paperclip, X } from "lucide-react";
import { useConversationHistory } from "@/hooks/useConversationHistory";
import { supabase } from "@/integrations/supabase/client";
import { aiService } from "@/services/aiService";
import { uploadTimelineMedia } from "@/utils/uploadTimelineMedia";
import type { AIMessage } from "@/services/aiService";

interface FakeUserChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    id: string;
    name: string;
    avatar: string;
    aiPrompt: string;
  } | null;
  userRealId?: string; // Truyền user id thật vào prop này để fetch
}

const AI_REPLY_DELAY = 60 * 60 * 1000; // 1 giờ (ms)
const DEMO_AI_REPLY_DELAY = 60000; // 1 phút để demo

const DummyAIReply = (prompt: string) => {
  // Đơn giản hóa: dùng prompt tạo reply
  return `(${prompt.slice(0,40)}...) [AI tự động trả lời]`;
};

const FakeUserChatModal = ({ isOpen, onClose, user, userRealId }: FakeUserChatModalProps) => {
  const [sending, setSending] = useState(false);
  const aiTimeout = useRef<NodeJS.Timeout|null>(null);

  // Lấy lịch sử chat từ Supabase hook
  const { data: conversationData, isLoading, refetch } = useConversationHistory(userRealId || "", user?.id || null);

  const [input, setInput] = useState("");
  const [localMessages, setLocalMessages] = useState<any[]>([]);
  const [isAITyping, setIsAITyping] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const scrollEndRef = useRef<HTMLDivElement>(null);

  // Reset khi mở modal hoặc user ảo mới
  useEffect(() => {
    setInput("");
    setLocalMessages([]);
    setSelectedFile(null);
    // Nếu modal vừa đóng thì clear timeout AI
    if (!isOpen && aiTimeout.current) clearTimeout(aiTimeout.current);
  }, [isOpen, user?.id]);

  // Luôn scroll xuống cuối khi có tin nhắn mới
  useEffect(() => {
    scrollEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversationData, localMessages]);

  // LẤY API KEY từ localStorage, nếu có thì truyền vào aiService
  useEffect(() => {
    if (!isOpen) return;
    try {
      const settings = localStorage.getItem('datingAppSettings');
      if (settings) {
        const parsed = JSON.parse(settings);
        if (parsed.openaiApiKey) {
          aiService.setApiKey(parsed.openaiApiKey);
        }
      }
    } catch {}
  }, [isOpen]);

  // Auto AI trả lời nếu không có reply từ admin
  useEffect(() => {
    if (!isOpen || !user) return;
    if (aiTimeout.current) clearTimeout(aiTimeout.current);

    const mergedMsgs = [...(conversationData?.messages || []), ...localMessages];
    if (mergedMsgs.length === 0) return;

    const lastMsg = mergedMsgs[mergedMsgs.length - 1];
    if (lastMsg.sender === "admin") {
      aiTimeout.current = setTimeout(async () => {
        let aiReplyText = "";
        let usedOpenAI = false;
        try {
          // chỉ generate AI nếu có API Key đã set vào aiService
          if ((aiService as any).apiKey) {
            setIsAITyping(true);
            const messagesForAI: AIMessage[] = mergedMsgs.map((m) => ({
              role: m.sender === "admin" ? "user" : "assistant",
              content: m.content,
            }));
            const aiResp = await aiService.generateResponse(messagesForAI, user.aiPrompt || "friendly");
            aiReplyText = aiResp.message;
            usedOpenAI = true;
          }
        } catch (err) {
          aiReplyText = DummyAIReply(user.aiPrompt);
        }
        if (!aiReplyText) aiReplyText = DummyAIReply(user.aiPrompt);

        // Nếu đã có conversation trên DB -> insert ngược vào Supabase
        if (conversationData?.id) {
          await supabase.from("messages").insert({
            conversation_id: conversationData.id,
            sender: "fake",
            content: aiReplyText,
          });
          refetch(); // Sync lại latest messages
        } else {
          // Local-only
          setLocalMessages(prev => [
            ...prev,
            {
              id: Date.now() + "_ai",
              sender: "fake",
              content: aiReplyText,
              created_at: new Date().toISOString()
            }
          ]);
        }
        setIsAITyping(false);
      }, DEMO_AI_REPLY_DELAY);
    }
    // eslint-disable-next-line
  }, [conversationData, localMessages, isOpen, user]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        alert("File quá lớn. Vui lòng chọn file dưới 10MB");
        return;
      }
      if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
        alert("Chỉ hỗ trợ file ảnh và video");
        return;
      }
      setSelectedFile(file);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
  };

  // GỬI TIN NHẮN: tạo conversation nếu chưa có, insert message
  const handleSend = async () => {
    if (sending || (!input.trim() && !selectedFile) || !userRealId || !user) return;
    setSending(true);
    setUploading(true);

    let messageContent = input.trim();
    let mediaUrl = "";
    let mediaType = "";

    // Upload file nếu có
    if (selectedFile) {
      try {
        mediaUrl = await uploadTimelineMedia(selectedFile);
        mediaType = selectedFile.type.startsWith('image/') ? 'image' : 'video';
        if (!messageContent) {
          messageContent = selectedFile.type.startsWith('image/') ? "[Ảnh]" : "[Video]";
        }
      } catch (error) {
        alert("Lỗi upload file");
        setSending(false);
        setUploading(false);
        return;
      }
    }

    // Đã có conversation trên db: gửi message mới
    if (conversationData?.id) {
      const { error } = await supabase.from("messages").insert({
        conversation_id: conversationData.id,
        sender: "admin",
        content: messageContent,
        media_url: mediaUrl || null,
        media_type: mediaType || null,
      });
      if (!error) {
        setInput("");
        setSelectedFile(null);
        refetch();
      } else {
        // fallback: show error, vẫn append local
        setLocalMessages(prev => [
          ...prev,
          {
            id: Date.now() + "_admin_err",
            sender: "admin",
            content: messageContent,
            media_url: mediaUrl,
            media_type: mediaType,
            created_at: new Date().toISOString()
          }
        ]);
        setInput("");
        setSelectedFile(null);
      }
      setSending(false);
      setUploading(false);
      return;
    }

    // Nếu chưa có conversation -> tạo mới
    const { data: conv, error: convErr } = await supabase
      .from("conversations")
      .insert({
        user_real_id: userRealId,
        user_fake_id: user.id,
        last_message: messageContent,
        last_message_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (conv?.id) {
      // Sau khi tạo, gửi message luôn
      await supabase.from("messages").insert({
        conversation_id: conv.id,
        sender: "admin",
        content: messageContent,
        media_url: mediaUrl || null,
        media_type: mediaType || null,
      });
      setInput("");
      setSelectedFile(null);
      refetch();
    } else {
      // fallback: show error, vẫn append local
      setLocalMessages(prev => [
        ...prev,
        {
          id: Date.now() + "_admin_err",
          sender: "admin",
          content: messageContent,
          media_url: mediaUrl,
          media_type: mediaType,
          created_at: new Date().toISOString()
        }
      ]);
      setInput("");
      setSelectedFile(null);
    }
    setSending(false);
    setUploading(false);
  };

  // Gộp tin nhắn local (gửi lỗi hoặc trước khi tạo conversation) + messages từ Supabase
  const mergedMessages = [
    ...(conversationData?.messages || []).map(msg => ({
      id: msg.id,
      sender: msg.sender === "real" ? "admin" : (msg.sender === "fake" ? "ai" : msg.sender),
      content: msg.content,
      media_url: msg.media_url,
      media_type: msg.media_type,
      created_at: msg.created_at
    })),
    ...localMessages, // những tin chưa lưu DB
  ];

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
              {/* Nếu chưa có lịch sử: lời chào đầu tiên */}
              {mergedMessages.length === 0 && user && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 text-gray-800 rounded-2xl px-4 py-2 max-w-sm">
                    Xin chào Admin, bạn muốn hỏi gì với "{user.name}"?
                  </div>
                </div>
              )}
              {mergedMessages.map(msg => (
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
                    {msg.media_url && (
                      <div className="mb-2">
                        {msg.media_type === 'image' ? (
                          <img 
                            src={msg.media_url} 
                            alt="Hình ảnh" 
                            className="max-w-full h-auto rounded-lg"
                            style={{ maxHeight: '200px' }}
                          />
                        ) : msg.media_type === 'video' ? (
                          <video 
                            src={msg.media_url} 
                            controls 
                            className="max-w-full h-auto rounded-lg"
                            style={{ maxHeight: '200px' }}
                          />
                        ) : null}
                      </div>
                    )}
                    {msg.content}
                  </div>
                </div>
              ))}
              <div ref={scrollEndRef}></div>
            </div>
          </ScrollArea>
          
          {/* File preview */}
          {selectedFile && (
            <div className="p-3 bg-gray-50 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                {selectedFile.type.startsWith('image/') ? (
                  <ImageIcon className="w-4 h-4 text-blue-500" />
                ) : (
                  <VideoIcon className="w-4 h-4 text-purple-500" />
                )}
                <span className="text-sm">{selectedFile.name}</span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={removeFile}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}
          
          <div className="flex gap-2 mt-auto">
            <div className="relative">
              <Input
                type="file"
                accept="image/*,video/*"
                onChange={handleFileSelect}
                className="absolute inset-0 opacity-0 cursor-pointer"
                id="file-input"
                disabled={sending}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                disabled={sending}
                title="Đính kèm file"
              >
                <Paperclip className="w-4 h-4" />
              </Button>
            </div>
            <Input
              value={input}
              onChange={e => setInput(e.target.value)}
              className="flex-1"
              placeholder="Nhập tin nhắn..."
              onKeyDown={(e) => { if (e.key === "Enter" && !sending) handleSend(); }}
              disabled={sending}
            />
            <Button 
              onClick={handleSend} 
              disabled={(!input.trim() && !selectedFile) || sending}
            >
              {uploading ? "Gửi..." : "Gửi"}
            </Button>
          </div>
        </div>
        <div className="text-xs text-gray-400 pt-1">
          Nếu admin không trả lời sau 1 phút, AI sẽ tự động phản hồi cho demo (bình thường là 1 giờ)
          {isAITyping && (
            <span className="ml-2 text-purple-500 font-semibold animate-pulse">AI đang trả lời...</span>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FakeUserChatModal;
