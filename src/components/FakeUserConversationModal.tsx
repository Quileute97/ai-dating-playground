
import React, { useEffect, useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";

interface Conversation {
  id: string;
  user_real_id: string;
  user_fake_id: string;
  created_at: string;
  last_message: string | null;
  last_message_at: string | null;
  real_user_profile?: {
    id: string;
    name: string | null;
    avatar: string | null;
    gender: string | null;
    age: number | null;
  }
}

interface Message {
  id: string;
  sender: "real" | "fake";
  content: string;
  created_at: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  fakeUser: {
    id: string;
    name: string;
    avatar: string;
    gender: string;
    age: number;
  } | null;
}

const FakeUserConversationModal: React.FC<Props> = ({ isOpen, onClose, fakeUser }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMsg, setNewMsg] = useState("");
  const [loadingConvs, setLoadingConvs] = useState(false);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);
  const [sending, setSending] = useState(false);

  // Lấy danh sách các conversation của user ảo này
  useEffect(() => {
    if (!isOpen || !fakeUser) {
      setConversations([]);
      setActiveConv(null);
      setMessages([]);
      return;
    }
    setLoadingConvs(true);
    (async () => {
      // Lấy danh sách conversation kèm profile user_thật
      const { data, error } = await supabase
        .from("conversations")
        .select("id, user_real_id, user_fake_id, created_at, last_message, last_message_at")
        .eq("user_fake_id", fakeUser.id)
        .order("last_message_at", { ascending: false });
      if (data) {
        // Lấy info user_thật cho từng conv
        const userIds = data.map(c => c.user_real_id).filter(Boolean);
        let profiles: Record<string, any> = {};
        if (userIds.length) {
          const { data: profilesData } = await supabase.from("profiles").select("*").in("id", userIds);
          profilesData?.forEach((p: any) => { profiles[p.id] = p; });
        }
        setConversations(
          data.map((c: any) => ({
            ...c,
            real_user_profile: c.user_real_id && profiles[c.user_real_id]
              ? {
                  id: profiles[c.user_real_id].id,
                  name: profiles[c.user_real_id].name,
                  avatar: profiles[c.user_real_id].avatar,
                  gender: profiles[c.user_real_id].gender,
                  age: profiles[c.user_real_id].age,
                }
              : undefined
          }))
        );
        if (data.length > 0)
          setActiveConv((prev) => prev || { ...data[0] });
      }
      setLoadingConvs(false);
    })();
  }, [isOpen, fakeUser]);

  // Lấy messages của conversation khi chọn conv
  useEffect(() => {
    if (!activeConv) {
      setMessages([]);
      return;
    }
    setLoadingMsgs(true);
    (async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", activeConv.id)
        .order("created_at", { ascending: true });
      setMessages(data || []);
      setLoadingMsgs(false);
      // Khi chọn conv mới, kéo xuống cuối
      setTimeout(() => {
        chatRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 50);
    })();
  }, [activeConv?.id]);

  // Kéo xuống cuối khi gửi
  useEffect(() => {
    chatRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  // Gửi tin nhắn dưới danh nghĩa "fake" (user ảo)
  const handleSendMsg = async () => {
    if (!activeConv?.id || !newMsg.trim() || sending) return;
    setSending(true);
    await supabase.from("messages").insert({
      conversation_id: activeConv.id,
      sender: "fake",
      content: newMsg.trim(),
    });
    setNewMsg("");
    // Load lại msg (hoặc có thể append local nhưng để sync DB vẫn nên refetch)
    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", activeConv.id)
      .order("created_at", { ascending: true });
    setMessages(data || []);
    setSending(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-3xl p-0 overflow-hidden">
        <DialogHeader className="pt-6 pl-6 pr-6 pb-0">
          <DialogTitle>
            Danh sách hội thoại của <span className="text-pink-600">{fakeUser?.name}</span>
          </DialogTitle>
        </DialogHeader>
        <div className="flex h-[60vh]">
          {/* Sidebar conv list */}
          <div className="w-80 border-r bg-gray-50 flex flex-col">
            <div className="p-3 font-semibold text-gray-700 border-b">Người thật đã nhắn</div>
            <ScrollArea className="flex-1">
              {loadingConvs && <div className="p-3">Đang tải...</div>}
              {!loadingConvs && conversations.length === 0 && (
                <div className="p-3 text-gray-500">Chưa có cuộc hội thoại.</div>
              )}
              {!loadingConvs &&
                conversations.map((conv, idx) => (
                  <div
                    key={conv.id}
                    className={`flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-purple-100 transition ${
                      activeConv?.id === conv.id ? "bg-purple-50 font-semibold" : ""
                    }`}
                    onClick={() => setActiveConv(conv)}
                  >
                    <img
                      src={conv.real_user_profile?.avatar || "/placeholder.svg"}
                      alt={conv.real_user_profile?.name || ""}
                      className="w-10 h-10 rounded-full border object-cover"
                    />
                    <div>
                      <div className="text-sm">{conv.real_user_profile?.name || conv.user_real_id}</div>
                      <div className="text-xs text-gray-400">
                        {conv.real_user_profile?.age ? `${conv.real_user_profile?.age} tuổi, ` : ""}
                        {conv.real_user_profile?.gender === "female" ? "Nữ" : conv.real_user_profile?.gender === "male" ? "Nam" : ""}
                      </div>
                      <div className="text-xs text-gray-500 line-clamp-1" title={conv.last_message ?? ""}>
                        {conv.last_message}
                      </div>
                    </div>
                  </div>
                ))}
            </ScrollArea>
          </div>
          {/* Main chat detail */}
          <div className="flex-1 flex flex-col">
            {/* Header */}
            <div className="border-b px-6 py-3 flex items-center gap-3">
              {activeConv?.real_user_profile && (
                <>
                  <img
                    src={activeConv.real_user_profile.avatar || "/placeholder.svg"}
                    alt={activeConv.real_user_profile.name || ""}
                    className="w-10 h-10 rounded-full object-cover border"
                  />
                  <div>
                    <div className="font-semibold">{activeConv.real_user_profile.name || activeConv.user_real_id}</div>
                    <div className="text-xs text-gray-500">
                      {activeConv.real_user_profile.age ? `${activeConv.real_user_profile.age} tuổi, ` : ""}
                      {activeConv.real_user_profile.gender === "female" ? "Nữ" : activeConv.real_user_profile.gender === "male" ? "Nam" : ""}
                    </div>
                  </div>
                </>
              )}
              {!activeConv?.real_user_profile && <div className="text-gray-500">User {activeConv?.user_real_id}</div>}
            </div>
            {/* Messages */}
            <ScrollArea className="flex-1 px-6 py-4">
              <div className="flex flex-col gap-2">
                {loadingMsgs && <div>Đang tải tin nhắn...</div>}
                {!loadingMsgs &&
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender === "fake" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={
                          msg.sender === "fake"
                            ? "bg-pink-500 text-white rounded-2xl px-4 py-2 max-w-md"
                            : "bg-gray-100 text-gray-800 rounded-2xl px-4 py-2 max-w-md"
                        }
                      >
                        {msg.content}
                      </div>
                    </div>
                  ))}
                <div ref={chatRef}></div>
              </div>
            </ScrollArea>
            {/* Input send */}
            <div className="flex gap-2 px-6 py-3 border-t">
              <Input
                value={newMsg}
                onChange={(e) => setNewMsg(e.target.value)}
                className="flex-1"
                placeholder="Nhập tin nhắn..."
                onKeyDown={(e) => { if (e.key === "Enter" && !sending) handleSendMsg(); }}
                disabled={sending || !activeConv}
              />
              <Button onClick={handleSendMsg} disabled={!newMsg.trim() || !activeConv || sending}>
                Gửi
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FakeUserConversationModal;

