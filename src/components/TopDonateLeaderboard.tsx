import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, Trophy, Medal } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { getDefaultAvatar } from '@/utils/getDefaultAvatar';

interface LeaderboardEntry {
  user_id: string;
  total_received: number;
  name: string | null;
  avatar: string | null;
  gender: string | null;
}

export default function TopDonateLeaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
    const interval = setInterval(fetchLeaderboard, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchLeaderboard = async () => {
    // Get top receivers from star_transactions
    const { data: txns } = await supabase
      .from('star_transactions')
      .select('user_id, amount')
      .eq('type', 'donate_received');

    if (!txns || txns.length === 0) {
      setEntries([]);
      setLoading(false);
      return;
    }

    // Aggregate by user_id
    const totals: Record<string, number> = {};
    txns.forEach(t => {
      totals[t.user_id] = (totals[t.user_id] || 0) + t.amount;
    });

    const sorted = Object.entries(totals)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 20);

    const userIds = sorted.map(([id]) => id);
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, name, avatar, gender')
      .in('id', userIds);

    const profileMap = new Map((profiles || []).map(p => [p.id, p]));

    setEntries(sorted.map(([userId, total]) => ({
      user_id: userId,
      total_received: total,
      name: profileMap.get(userId)?.name || null,
      avatar: profileMap.get(userId)?.avatar || null,
      gender: profileMap.get(userId)?.gender || null,
    })));
    setLoading(false);
  };

  const getRankIcon = (index: number) => {
    if (index === 0) return <Trophy className="w-5 h-5 text-yellow-500" />;
    if (index === 1) return <Medal className="w-5 h-5 text-gray-400" />;
    if (index === 2) return <Medal className="w-5 h-5 text-amber-600" />;
    return <span className="w-5 h-5 flex items-center justify-center text-xs font-bold text-muted-foreground">{index + 1}</span>;
  };

  return (
    <div className="w-full lg:w-72 bg-background lg:border-l border-border flex flex-col">
      <div className="p-4 flex items-center gap-2">
        <Star className="w-4 h-4 text-yellow-500" />
        <h2 className="text-sm font-semibold text-foreground">Top Donate ⭐</h2>
      </div>
      <Separator />
      <ScrollArea className="flex-1 p-3">
        {loading ? (
          <div className="text-center text-muted-foreground text-sm py-8">Đang tải...</div>
        ) : entries.length === 0 ? (
          <div className="text-center text-muted-foreground text-sm py-8">
            Chưa có ai nhận donate
          </div>
        ) : (
          <div className="space-y-1">
            {entries.map((entry, index) => (
              <div
                key={entry.user_id}
                className={`flex items-center gap-2.5 p-2 rounded-lg transition-colors ${
                  index < 3 ? 'bg-accent/50' : 'hover:bg-accent/30'
                }`}
              >
                {getRankIcon(index)}
                <Avatar className="w-8 h-8">
                  <AvatarImage src={getDefaultAvatar(entry.gender, entry.avatar)} />
                  <AvatarFallback>{entry.name?.slice(0, 2)?.toUpperCase() || '?'}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate text-foreground">{entry.name || 'Ẩn danh'}</p>
                </div>
                <div className="flex items-center gap-0.5 text-sm font-semibold text-yellow-600">
                  {entry.total_received}
                  <Star className="w-3.5 h-3.5 fill-yellow-500 text-yellow-500" />
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
