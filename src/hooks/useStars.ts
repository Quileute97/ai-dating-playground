import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface StarBalance {
  balance: number;
  lastDailyClaim: string | null;
  canClaimDaily: boolean;
}

export function useStars(userId?: string) {
  const [starBalance, setStarBalance] = useState<StarBalance>({ balance: 0, lastDailyClaim: null, canClaimDaily: true });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchBalance = useCallback(async () => {
    if (!userId) return;
    const { data } = await supabase
      .from('user_stars')
      .select('balance, last_daily_claim')
      .eq('user_id', userId)
      .maybeSingle();

    if (data) {
      const today = new Date().toDateString();
      const lastClaim = data.last_daily_claim ? new Date(data.last_daily_claim).toDateString() : null;
      setStarBalance({
        balance: data.balance,
        lastDailyClaim: data.last_daily_claim,
        canClaimDaily: lastClaim !== today,
      });
    } else {
      setStarBalance({ balance: 0, lastDailyClaim: null, canClaimDaily: true });
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => { fetchBalance(); }, [fetchBalance]);

  const claimDaily = async () => {
    if (!userId) return false;
    try {
      console.log('⭐ Claiming daily stars for user:', userId);
      const { data, error } = await supabase.rpc('claim_daily_stars', { user_id_param: userId });
      console.log('⭐ Claim result:', { data, error });
      if (error) {
        console.error('⭐ Claim error:', error);
        toast({ title: 'Lỗi', description: `Không thể nhận sao: ${error.message}`, variant: 'destructive' });
        return false;
      }
      if (data === false) {
        toast({ title: 'Đã nhận rồi', description: 'Bạn đã nhận sao miễn phí hôm nay.' });
        await fetchBalance();
        return false;
      }
      toast({ title: '⭐ Nhận sao thành công!', description: 'Bạn đã nhận 5 sao miễn phí hôm nay!' });
      await fetchBalance();
      return true;
    } catch (err) {
      console.error('⭐ Claim exception:', err);
      toast({ title: 'Lỗi', description: 'Không thể nhận sao hàng ngày.', variant: 'destructive' });
      return false;
    }
  };

  const donateStars = async (receiverId: string, amount: number, postId?: string, note?: string) => {
    if (!userId) return false;
    if (starBalance.balance < amount) {
      toast({ title: 'Không đủ sao', description: 'Bạn không có đủ sao để donate.', variant: 'destructive' });
      return false;
    }
    const { data, error } = await supabase.rpc('donate_stars', {
      sender_id_param: userId,
      receiver_id_param: receiverId,
      amount_param: amount,
      post_id_param: postId || null,
      note_param: note || null,
    });
    if (error || data === false) {
      toast({ title: 'Lỗi', description: 'Không thể donate sao. Vui lòng thử lại.', variant: 'destructive' });
      return false;
    }
    toast({ title: '⭐ Donate thành công!', description: `Bạn đã donate ${amount} sao.` });
    await fetchBalance();
    return true;
  };

  const addStars = async (amount: number) => {
    if (!userId) return;
    // Upsert balance
    const { data: existing } = await supabase
      .from('user_stars')
      .select('id, balance')
      .eq('user_id', userId)
      .maybeSingle();

    if (existing) {
      await supabase.from('user_stars').update({ balance: existing.balance + amount }).eq('user_id', userId);
    } else {
      await supabase.from('user_stars').insert({ user_id: userId, balance: amount });
    }

    await supabase.from('star_transactions').insert({
      user_id: userId,
      type: 'purchase',
      amount,
    });

    await fetchBalance();
  };

  return { starBalance, loading, claimDaily, donateStars, addStars, refetch: fetchBalance };
}

export function useUserStarBalance(userId?: string) {
  const [balance, setBalance] = useState(0);
  
  useEffect(() => {
    if (!userId) return;
    supabase
      .from('user_stars')
      .select('balance')
      .eq('user_id', userId)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setBalance(data.balance);
      });
  }, [userId]);

  return balance;
}
