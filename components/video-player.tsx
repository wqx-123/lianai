'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Play, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

interface VideoPlayerProps {
  url: string;
  type: 'local' | 'youtube' | 'bilibili' | 'vimeo' | 'other';
  title: string;
  isOpen?: boolean;
  onClose?: () => void;
}

// 从 URL 提取视频 ID
function extractVideoId(url: string, type: string): string | null {
  switch (type) {
    case 'youtube':
      const youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
      return youtubeMatch ? youtubeMatch[1] : null;

    case 'bilibili':
      const bilibiliMatch = url.match(/\/(BV[\w]+)|\/(av[\d]+)/);
      if (bilibiliMatch) {
        return bilibiliMatch[1] || bilibiliMatch[2];
      }
      const bilibiliEmbedMatch = url.match(/bilibili\.com\/embed\/([^/?]+)/);
      return bilibiliEmbedMatch ? bilibiliEmbedMatch[1] : null;

    case 'vimeo':
      const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
      return vimeoMatch ? vimeoMatch[1] : null;

    default:
      return null;
  }
}

// 生成嵌入代码 URL
function getEmbedUrl(url: string, type: string): string | null {
  const videoId = extractVideoId(url, type);
  if (!videoId) return null;

  switch (type) {
    case 'youtube':
      return `https://www.youtube.com/embed/${videoId}`;
    case 'bilibili':
      return `https://player.bilibili.com/player.html?bvid=${videoId}&high_quality=1&autoplay=0`;
    case 'vimeo':
      return `https://player.vimeo.com/video/${videoId}`;
    default:
      return null;
  }
}

export function VideoPlayer({ url, type, title, isOpen, onClose }: VideoPlayerProps) {
  const [isModalOpen, setIsModalOpen] = useState(isOpen || false);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleOpen = () => {
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsPlaying(false);
    setIsModalOpen(false);
    onClose?.();
  };

  // 本地视频直接播放
  if (type === 'local') {
    return (
      <>
        <Button
          variant="outline"
          size="sm"
          onClick={handleOpen}
          className="gap-2"
        >
          <Play className="h-4 w-4" />
          观看片段
        </Button>

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-4xl w-full p-0 overflow-hidden">
            <DialogTitle className="sr-only">{title}</DialogTitle>
            <DialogDescription className="sr-only">视频播放器</DialogDescription>
            <div className="relative bg-black">
              {/* 关闭按钮 */}
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>

              {/* 标题 */}
              <div className="bg-muted px-4 py-2 border-b">
                <h3 className="font-semibold text-sm truncate">{title}</h3>
              </div>

              {/* 本地视频播放器 */}
              <div className="aspect-video">
                <video
                  src={url}
                  controls
                  autoPlay={isPlaying}
                  className="w-full h-full"
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                >
                  您的浏览器不支持视频播放
                </video>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  // 在线视频使用嵌入方式
  const embedUrl = getEmbedUrl(url, type);

  if (!embedUrl) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => window.open(url, '_blank')}
        className="gap-2"
      >
        <Play className="h-4 w-4" />
        观看视频
      </Button>
    );
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={handleOpen}
        className="gap-2"
      >
        <Play className="h-4 w-4" />
        观看片段
      </Button>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl w-full p-0 overflow-hidden">
          <DialogTitle className="sr-only">{title}</DialogTitle>
          <DialogDescription className="sr-only">视频播放器</DialogDescription>
          <div className="relative">
            {/* 关闭按钮 */}
            <button
              onClick={handleClose}
              className="absolute top-2 right-2 z-10 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            {/* 标题 */}
            <div className="bg-muted px-4 py-2 border-b">
              <h3 className="font-semibold text-sm truncate">{title}</h3>
            </div>

            {/* 视频容器 */}
            <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
              <iframe
                src={embedUrl}
                title={title}
                className="absolute top-0 left-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// 缩略图卡片组件
interface VideoThumbnailProps {
  url: string;
  type: 'local' | 'youtube' | 'bilibili' | 'vimeo' | 'other';
  title: string;
  description?: string;
}

export function VideoThumbnail({ url, type, title, description }: VideoThumbnailProps) {
  const videoId = extractVideoId(url, type);
  let thumbnailUrl = '';
  let platformName = '';

  // 获取缩略图
  if (type === 'youtube' && videoId) {
    thumbnailUrl = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
    platformName = 'YouTube';
  } else if (type === 'bilibili') {
    thumbnailUrl = '/placeholder-video.png';
    platformName = 'B站';
  } else if (type === 'local') {
    thumbnailUrl = '/placeholder-video.png';
    platformName = '本地视频';
  }

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer group">
      <div className="relative aspect-video bg-muted">
        {thumbnailUrl && !thumbnailUrl.startsWith('/') ? (
          <img
            src={thumbnailUrl}
            alt={title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Play className="h-12 w-12 text-muted-foreground group-hover:scale-110 transition-transform" />
          </div>
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Play className="h-5 w-5 text-black ml-1" />
          </div>
        </div>
        <Badge className="absolute bottom-2 right-2 bg-black/70">
          {platformName}
        </Badge>
      </div>
      {(title || description) && (
        <div className="p-3">
          {title && <h4 className="font-semibold text-sm line-clamp-1">{title}</h4>}
          {description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{description}</p>}
        </div>
      )}
    </Card>
  );
}
