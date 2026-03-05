import React, { useState } from 'react';
import { Star, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

const QUICK_AMOUNTS = [1, 5, 10, 50];

interface DonateStarModalProps {
  isOpen: boolean;
  onClose: () => void;
  receiverName: string;
  receiverId: string;
  postId?: string;
  currentBalance: number;
  onDonate: (receiverId: string, amount: number, postId?: string) => Promise<boolean>;
}

const DonateStarModal: React.FC<DonateStarModalProps> = ({
  isOpen, onClose, receiverName, receiverId, postId, currentBalance, onDonate
}) => {
  const [amount, setAmount] = useState(1);
  const [sending, setSending] = useState(false);

  const handleDonate = async () => {
    if (amount <= 0 || amount > currentBalance) return;
    setSending(true);
    const success = await onDonate(receiverId, amount, postId);
    setSending(false);
    if (success) onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xs">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-400" />
            Donate cho {receiverName}
          </DialogTitle>
        </DialogHeader>

        <div className="text-center text-sm text-muted-foreground mb-2">
          Số dư: <span className="font-semibold text-yellow-600">{currentBalance} ⭐</span>
        </div>

        <div className="flex gap-2 justify-center mb-3">
          {QUICK_AMOUNTS.map((q) => (
            <Button
              key={q}
              size="sm"
              variant={amount === q ? 'default' : 'outline'}
              onClick={() => setAmount(q)}
              className="rounded-full px-3"
            >
              {q} ⭐
            </Button>
          ))}
        </div>

        <div className="flex items-center gap-2 mb-3">
          <Input
            type="number"
            min={1}
            max={currentBalance}
            value={amount}
            onChange={(e) => setAmount(Math.max(1, parseInt(e.target.value) || 1))}
            className="text-center"
          />
          <span className="text-sm text-muted-foreground whitespace-nowrap">sao</span>
        </div>

        {amount > currentBalance && (
          <p className="text-xs text-destructive text-center mb-2">Không đủ sao!</p>
        )}

        <Button
          onClick={handleDonate}
          disabled={sending || amount <= 0 || amount > currentBalance}
          className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white"
        >
          <Send className="w-4 h-4 mr-2" />
          {sending ? 'Đang gửi...' : `Donate ${amount} ⭐`}
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default DonateStarModal;
