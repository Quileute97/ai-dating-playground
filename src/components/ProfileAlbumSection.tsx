import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, X, Upload, Trash2, GripVertical, Plus, Album as AlbumIcon, Loader2 } from 'lucide-react';
import { uploadAlbumImage } from '@/utils/uploadAlbumImage';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ProfileAlbumHandle {
  openViewer: (index?: number) => void;
  openGrid: () => void;
}

interface Props {
  userId: string;
  album: string[];
  isOwner: boolean;
  onAlbumChange?: (album: string[]) => void;
}

const ProfileAlbumSection = forwardRef<ProfileAlbumHandle, Props>(({ userId, album, isOwner, onAlbumChange }, ref) => {
  const [items, setItems] = useState<string[]>(Array.isArray(album) ? album : []);
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  const [gridOpen, setGridOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    setItems(Array.isArray(album) ? album : []);
  }, [album]);

  const persist = useCallback(async (next: string[]) => {
    setItems(next);
    onAlbumChange?.(next);
    const { error } = await supabase
      .from('profiles')
      .update({ album: next, last_active: new Date().toISOString() })
      .eq('id', userId);
    if (error) {
      toast({ title: 'Lỗi', description: 'Không thể cập nhật album: ' + error.message, variant: 'destructive' });
    }
  }, [userId, onAlbumChange, toast]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !files.length) return;
    setUploading(true);
    const uploaded: string[] = [];
    try {
      for (const f of Array.from(files)) {
        const url = await uploadAlbumImage(f);
        uploaded.push(url);
      }
      await persist([...items, ...uploaded]);
      toast({ title: 'Đã tải lên', description: `Thêm ${uploaded.length} ảnh vào album.` });
    } catch (err: any) {
      toast({ title: 'Lỗi', description: err.message || 'Không thể tải ảnh lên', variant: 'destructive' });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (idx: number) => {
    const next = items.filter((_, i) => i !== idx);
    await persist(next);
  };

  const handleDragStart = (idx: number) => setDragIndex(idx);
  const handleDragOver = (e: React.DragEvent) => e.preventDefault();
  const handleDrop = async (idx: number) => {
    if (dragIndex === null || dragIndex === idx) { setDragIndex(null); return; }
    const next = [...items];
    const [moved] = next.splice(dragIndex, 1);
    next.splice(idx, 0, moved);
    setDragIndex(null);
    await persist(next);
  };

  // Keyboard nav for viewer
  useEffect(() => {
    if (viewerIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') setViewerIndex(i => (i === null ? null : (i - 1 + items.length) % items.length));
      if (e.key === 'ArrowRight') setViewerIndex(i => (i === null ? null : (i + 1) % items.length));
      if (e.key === 'Escape') setViewerIndex(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [viewerIndex, items.length]);

  // Touch swipe
  const touchRef = useRef<{ x: number; y: number } | null>(null);
  const onTouchStart = (e: React.TouchEvent) => {
    touchRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (!touchRef.current) return;
    const dx = e.changedTouches[0].clientX - touchRef.current.x;
    const dy = e.changedTouches[0].clientY - touchRef.current.y;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
      if (dx < 0) setViewerIndex(i => (i === null ? null : (i + 1) % items.length));
      else setViewerIndex(i => (i === null ? null : (i - 1 + items.length) % items.length));
    }
    touchRef.current = null;
  };

  if (!items.length && !isOwner) return null;

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em]">
          Album ảnh · {items.length}
        </h3>
        <div className="flex items-center gap-2">
          {isOwner && (
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="text-xs text-rose-500 font-semibold hover:text-rose-600 inline-flex items-center gap-1 disabled:opacity-50"
            >
              {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
              {uploading ? 'Đang tải...' : 'Tải ảnh'}
            </button>
          )}
          {items.length > 0 && (
            <button
              onClick={() => setGridOpen(true)}
              className="text-xs text-slate-500 font-semibold hover:text-slate-700"
            >
              Xem tất cả →
            </button>
          )}
        </div>
      </div>

      {isOwner && (
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleUpload}
        />
      )}

      {items.length > 0 ? (
        <div className="grid grid-cols-3 gap-2">
          {items.slice(0, 6).map((img, idx) => (
            <button
              key={img + idx}
              onClick={() => setViewerIndex(idx)}
              className="relative group overflow-hidden rounded-xl aspect-square"
            >
              <img src={img} alt={`Ảnh ${idx + 1}`} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
              {idx === 5 && items.length > 6 && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm">
                  <span className="text-white font-bold text-sm">+{items.length - 6}</span>
                </div>
              )}
            </button>
          ))}
        </div>
      ) : (
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full aspect-[3/1] rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-1 text-slate-400 hover:border-rose-300 hover:text-rose-500 transition-colors"
        >
          <Plus className="w-6 h-6" />
          <span className="text-xs font-semibold">Thêm ảnh vào album</span>
        </button>
      )}

      {/* Grid modal — reorder / delete / upload */}
      <Dialog open={gridOpen} onOpenChange={setGridOpen}>
        <DialogContent className="w-full h-full max-w-full max-h-full overflow-hidden p-0 bg-slate-950/95 border-0 gap-0 rounded-none">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setGridOpen(false)}
            className="absolute top-2 right-2 z-50 h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white border border-white/20"
          >
            <X className="h-5 w-5" />
          </Button>

          <div className="h-full flex flex-col p-4 md:p-6">
            <div className="flex items-center justify-between mb-4 pt-2 pr-12">
              <h2 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
                <AlbumIcon className="w-5 h-5 text-rose-400" />
                Album ảnh · {items.length}
              </h2>
              {isOwner && (
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  size="sm"
                  className="bg-rose-500 hover:bg-rose-600 text-white rounded-full"
                >
                  {uploading ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <Upload className="w-4 h-4 mr-1.5" />}
                  Tải ảnh
                </Button>
              )}
            </div>

            {isOwner && (
              <p className="text-white/60 text-xs mb-3">
                {items.length > 1 ? 'Kéo ảnh để sắp xếp lại thứ tự. Ảnh đầu tiên là ảnh bìa.' : 'Ảnh đầu tiên sẽ được dùng làm ảnh bìa.'}
              </p>
            )}

            <div className="flex-1 overflow-y-auto -mx-2 px-2 custom-scrollbar">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 pb-4">
                {items.map((img, idx) => (
                  <div
                    key={img + idx}
                    draggable={isOwner}
                    onDragStart={() => handleDragStart(idx)}
                    onDragOver={handleDragOver}
                    onDrop={() => handleDrop(idx)}
                    className={`relative group aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                      dragIndex === idx ? 'border-rose-400 opacity-50' : 'border-transparent'
                    } ${idx === 0 ? 'ring-2 ring-amber-400' : ''}`}
                  >
                    <img
                      src={img}
                      alt={`Ảnh ${idx + 1}`}
                      onClick={() => setViewerIndex(idx)}
                      className="w-full h-full object-cover cursor-zoom-in"
                    />
                    {idx === 0 && (
                      <span className="absolute top-1.5 left-1.5 bg-amber-400 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        Ảnh bìa
                      </span>
                    )}
                    {isOwner && (
                      <>
                        <div className="absolute top-1.5 right-1.5 bg-black/50 backdrop-blur-sm p-1 rounded-md text-white/70 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab">
                          <GripVertical className="w-3.5 h-3.5" />
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDelete(idx); }}
                          className="absolute bottom-1.5 right-1.5 bg-red-500/90 hover:bg-red-600 p-1.5 rounded-md text-white opacity-0 group-hover:opacity-100 transition-opacity"
                          aria-label="Xóa ảnh"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                ))}

                {isOwner && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="aspect-square rounded-xl border-2 border-dashed border-white/30 flex flex-col items-center justify-center gap-1 text-white/60 hover:border-rose-400 hover:text-rose-400 transition-colors"
                  >
                    {uploading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Plus className="w-6 h-6" />}
                    <span className="text-xs font-semibold">Thêm ảnh</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Fullscreen viewer */}
      <Dialog open={viewerIndex !== null} onOpenChange={(open) => { if (!open) setViewerIndex(null); }}>
        <DialogContent className="w-full h-full max-w-full max-h-full overflow-hidden p-0 bg-black border-0 gap-0 rounded-none">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setViewerIndex(null)}
            className="absolute top-2 right-2 z-50 h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white border border-white/20"
          >
            <X className="h-5 w-5" />
          </Button>

          {viewerIndex !== null && items[viewerIndex] && (
            <div
              className="relative w-full h-full flex items-center justify-center"
              onTouchStart={onTouchStart}
              onTouchEnd={onTouchEnd}
            >
              <img
                src={items[viewerIndex]}
                alt={`Ảnh ${viewerIndex + 1}`}
                className="max-w-full max-h-full object-contain select-none"
              />

              {items.length > 1 && (
                <>
                  <button
                    onClick={() => setViewerIndex((viewerIndex - 1 + items.length) % items.length)}
                    className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 h-11 w-11 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white border border-white/20 flex items-center justify-center"
                    aria-label="Ảnh trước"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={() => setViewerIndex((viewerIndex + 1) % items.length)}
                    className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 h-11 w-11 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white border border-white/20 flex items-center justify-center"
                    aria-label="Ảnh kế tiếp"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}

              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full">
                {viewerIndex + 1} / {items.length}
              </div>

              {isOwner && (
                <button
                  onClick={async () => {
                    const idx = viewerIndex;
                    await handleDelete(idx);
                    if (items.length - 1 <= 0) setViewerIndex(null);
                    else setViewerIndex(Math.min(idx, items.length - 2));
                  }}
                  className="absolute bottom-4 right-4 bg-red-500/90 hover:bg-red-600 text-white h-10 w-10 rounded-full flex items-center justify-center backdrop-blur-sm"
                  aria-label="Xóa ảnh"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
});

ProfileAlbumSection.displayName = 'ProfileAlbumSection';

export default ProfileAlbumSection;
