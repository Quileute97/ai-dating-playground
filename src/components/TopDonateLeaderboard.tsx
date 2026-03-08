import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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

export function useLeaderboardData() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
    const interval = setInterval(fetchLeaderboard, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchLeaderboard = async () => {
    const { data: txns } = await supabase
      .from('star_transactions')
      .select('user_id, amount')
      .eq('type', 'donate_received');

    if (!txns || txns.length === 0) {
      setEntries([]);
      setLoading(false);
      return;
    }

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

  return { entries, loading };
}

function getRankIcon(index: number) {
  if (index === 0) return <Trophy className="w-4 h-4 text-yellow-500" />;
  if (index === 1) return <Medal className="w-4 h-4 text-gray-400" />;
  if (index === 2) return <Medal className="w-4 h-4 text-amber-600" />;
  return <span className="w-4 text-center text-[10px] font-bold text-muted-foreground">{index + 1}</span>;
}

/** Mobile horizontal scrolling banner */
export function TopDonateBannerMobile() {
  const navigate = useNavigate();
  const { entries, loading } = useLeaderboardData();

  if (loading || entries.length === 0) return null;

  return (
    <div className="lg:hidden bg-gradient-to-r from-yellow-50 to-orange-50 border-b border-yellow-200/50">
      <div className="flex items-center gap-2 px-3 py-2">
        <div className="flex items-center gap-1 shrink-0">
          <Star className="w-3.5 h-3.5 fill-yellow-500 text-yellow-500" />
          <span className="text-xs font-semibold text-foreground whitespace-nowrap">Top Donate</span>
        </div>
        <div className="flex-1 overflow-x-auto scrollbar-hide">
          <div className="flex gap-2">
            {entries.slice(0, 10).map((entry, index) => (
              <div
                key={entry.user_id}
                onClick={() => navigate(`/profile/${entry.user_id}`)}
                className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-background/80 border border-border/50 shrink-0 cursor-pointer hover:bg-accent/50 transition-colors"
              >
                {getRankIcon(index)}
                <Avatar className="w-6 h-6">
                  <AvatarImage src={getDefaultAvatar(entry.gender, entry.avatar)} />
                  <AvatarFallback className="text-[8px]">{entry.name?.slice(0, 1) || '?'}</AvatarFallback>
                </Avatar>
                <span className="text-xs font-medium truncate max-w-[60px] text-foreground">{entry.name || 'Ẩn danh'}</span>
                <span className="text-[10px] font-semibold text-yellow-600">{entry.total_received}⭐</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Desktop sidebar panel */
export default function TopDonateLeaderboard() {
  const navigate = useNavigate();
  const { entries, loading } = useLeaderboardData();

  return (
    <div className="w-full lg:w-72 bg-background lg:border-l border-border flex flex-col">
      <div className="p-4 flex items-center gap-2">
        <Star className="w-4 h-4 text-yellow-500" />
        <h2 className="text-sm font-semibold text-foreground">Top Donate ⭐</h2>
      </div>
      <div className="border-b border-border" />
      <div className="flex-1 overflow-y-auto p-3">
        {loading ? (
          <div className="text-center text-muted-foreground text-sm py-8">Đang tải...</div>
        ) : entries.length === 0 ? (
          <div className="text-center text-muted-foreground text-sm py-8">Chưa có ai nhận donate</div>
        ) : (
          <div className="space-y-1">
            {entries.map((entry, index) => (
              <div
                key={entry.user_id}
                onClick={() => navigate(`/profile/${entry.user_id}`)}
                className={`flex items-center gap-2.5 p-2 rounded-lg transition-colors cursor-pointer ${
                  index < 3 ? 'bg-accent/50 hover:bg-accent/70' : 'hover:bg-accent/30'
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
      </div>
    </div>
  );
}
