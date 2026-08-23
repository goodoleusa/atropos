import { useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, Play, Pause, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VideoItem {
  filename: string;
  title: string;
  prompt: string;
  negativePrompt: string;
  category: string;
}

const VIDEOS: VideoItem[] = [
  {
    filename: "hero-one-card-sequence.mp4",
    title: "One Card Sequence (Current)",
    category: "Main",
    prompt: "Ultra slow motion single playing card floating down from unseen dealer. Strict rule: only ONE card visible in frame at any moment. Card drifts extremely slowly with gentle wobble through pure white void. When card reaches the messy pile at bottom and lands, only THEN does the next single card appear at top and begin falling. Never two cards in air simultaneously. Cards have realistic faces with proper suits - red hearts/diamonds, black clubs/spades. Static messy random pile of cards on white surface. Camera fixed angle, no zooming. Extremely slow hypnotic meditative pace, 4K quality, seamless loop.",
    negativePrompt: "two cards at once, multiple cards in air, overlapping cards, fast motion, hands, zooming, raining cards"
  },
  {
    filename: "hero-loop-A1.mp4",
    title: "Loop A1 - Top Left Entry",
    category: "Loop Set A",
    prompt: "Ultra slow motion single playing card entering from TOP LEFT of frame, back-first. Card drifts extremely slowly with gentle wobble through pure white void. Only ONE card visible at any moment. When card lands on messy pile at bottom, brief pause, then next card appears. Realistic card faces with proper suits. Camera fixed angle with very subtle slow pan. Extremely slow hypnotic meditative pace, 4K quality, clean loop point when card lands. No dolly or zoom effects.",
    negativePrompt: "multiple cards, fast motion, dolly, zoom towards camera, hands, face first entry"
  },
  {
    filename: "hero-loop-A2.mp4",
    title: "Loop A2 - Top Left Variant",
    category: "Loop Set A",
    prompt: "Ultra slow motion single playing card entering from TOP LEFT of frame, back-first, slightly different angle than before. Card drifts down with lazy tumble through white void. Only ONE card visible. When card reaches messy pile and lands, pause, next card enters from top left. Realistic playing card faces. Very subtle slow camera pan following descent. Extremely slow hypnotic pace, 4K, clean loop transition point.",
    negativePrompt: "multiple cards, fast motion, dolly, zoom, hands"
  },
  {
    filename: "hero-loop-A3.mp4",
    title: "Loop A3 - Top Left Tumble",
    category: "Loop Set A",
    prompt: "Ultra slow motion single playing card entering from TOP LEFT, back-first, with subtle end-over-end tumble. Only ONE card visible at any time. Card drifts extremely slowly through white void. Messy random pile of cards below. When card lands, brief clean pause for loop point, next card appears. Realistic card designs. Fixed camera with minimal movement. Hypnotic zen pace, 4K quality.",
    negativePrompt: "multiple cards, fast motion, dolly, zoom, hands"
  },
  {
    filename: "hero-loop-B1.mp4",
    title: "Loop B1 - Top Right Entry",
    category: "Loop Set B",
    prompt: "Ultra slow motion single playing card entering from TOP RIGHT of frame, back-first. Card floats extremely slowly with gentle organic wobble through pure white void. Only ONE card in frame at any time. When card lands on messy random pile, clean pause beat, then next card enters. Realistic card suits - red hearts/diamonds, black clubs/spades. Camera fixed with very subtle movement. Extremely slow zen-like pace, 4K quality, seamless loop break point.",
    negativePrompt: "multiple cards, fast motion, dolly, zoom, hands, face first entry"
  },
  {
    filename: "hero-loop-B2.mp4",
    title: "Loop B2 - Top Right Spiral",
    category: "Loop Set B",
    prompt: "Ultra slow motion single playing card entering from TOP RIGHT of frame, back-first, gentle spiral rotation as it descends. Only ONE card in frame at any moment. Card floats through pure white void to messy pile below. Clean pause when landing for seamless loop. Realistic card faces, proper red/black suits. Subtle slow camera movement. Extremely slow meditative pace, 4K quality.",
    negativePrompt: "multiple cards, fast motion, dolly, zoom, hands"
  },
  {
    filename: "hero-loop-B3.mp4",
    title: "Loop B3 - Top Right Float",
    category: "Loop Set B",
    prompt: "Ultra slow motion single playing card entering from TOP RIGHT, back-first, gentle floating descent with organic wobble. Only ONE card in frame. Pure white void background, messy card pile at bottom. Card lands with clean pause beat for seamless loop transition. Realistic playing card faces with proper suits. Subtle camera pan. Extremely slow hypnotic meditative pace, 4K, professional cinematography.",
    negativePrompt: "multiple cards, fast motion, dolly, zoom, hands"
  },
  {
    filename: "hero-back-first-orbit.mp4",
    title: "Back-First Orbit",
    category: "Camera Effects",
    prompt: "Ultra slow motion single playing card entering frame BACK-FIRST from top. Card drifts down with gentle spiral rotation, slowly revealing face. Only ONE card in frame at any time. Camera performs subtle slow orbit around the falling card, never quick or jarring. Card lands on messy random pile, clean pause for loop point, next card enters back-first. Pure white void background, realistic card suits. Extremely slow meditative hypnotic pace, 4K quality, professional cinematography.",
    negativePrompt: "multiple cards, fast motion, busy, face first, hands, quick camera moves"
  },
  {
    filename: "hero-back-first-focus.mp4",
    title: "Back-First Rack Focus",
    category: "Camera Effects",
    prompt: "Ultra slow motion single playing card entering frame BACK-FIRST. Card floats down with subtle rack focus effect - card sharp, background pile slightly soft, then reverses as card nears pile. Only ONE card visible at any moment. When card lands, clean pause beat for seamless loop, next card enters back-first. Pure white void, messy random pile, realistic card faces. Camera subtle slow pan following descent. Extremely slow zen-like pace, 4K quality.",
    negativePrompt: "multiple cards, fast motion, busy, face first, hands, quick cuts"
  },
  {
    filename: "hero-rain-messy-pile.mp4",
    title: "Rain Messy Pile",
    category: "Previous Versions",
    prompt: "Extreme slow motion playing cards raining down one by one from above through white void. Cards fall in sequence, one after another in continuous gentle cascade. Each card tumbles with organic wobbly motion as it descends. Static messy random jumble pile of realistically designed cards visible on white surface below. Cards have accurate faces with proper suits - hearts and diamonds in red, clubs and spades in black. Camera watches from fixed angle with subtle slow pans, cards never move towards viewer. Meditative zen pacing, 4K high definition, seamless loop, professional cinematography.",
    negativePrompt: "mixed suit colors, impossible card faces, zooming towards camera, hands, fast motion, neat pile, focusing on single card"
  },
  {
    filename: "hero-realistic-cards-v1.mp4",
    title: "Realistic Cards V1",
    category: "Previous Versions",
    prompt: "Extreme slow motion single realistic playing card tumbling down through white void. One card at a time. Cards have accurate faces with proper suits - hearts and diamonds in red, clubs and spades in black, standard court cards and pips matching real playing cards. Background features a static messy random jumble pile of realistically designed cards on white surface. Falling card has organic wobbly tumble descending vertically. Camera performs subtle slow pans and micro-pauses to highlight rotation, card never moves towards viewer. Meditative zen pacing, 4K high definition, seamless loop, professional cinematography.",
    negativePrompt: "mixed suit colors, impossible card faces, red spades, black hearts, fantasy cards, zooming towards camera, hands, multiple cards falling, fast motion, neat pile"
  },
  {
    filename: "hero-zen-messy-pile.mp4",
    title: "Zen Messy Pile",
    category: "Previous Versions",
    prompt: "Extreme slow motion single pristine playing card tumbling and falling vertically through a white void. One card visible at a time. Background features a static, completely random messy jumble of cards on a white surface, looking like a natural heap of fallen cards. The falling card has an organic, slightly wobbly tumble as it descends. Camera is static or performs subtle slow-motion pans and micro-zooms/pauses to highlight the card's rotation, but the card never moves towards the viewer. Pacing is meditative and zen-like. 4K high definition, professional cinematography, seamless loop.",
    negativePrompt: "zooming towards camera, card moving towards viewer, hands, people, raining cards, multiple cards falling at once, neat pile, fanned pile, changing pile, text, fast motion"
  }
];

export default function VideoGallery() {
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);
  const [copiedPrompt, setCopiedPrompt] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");

  const categories = ["all", ...Array.from(new Set(VIDEOS.map(v => v.category)))];
  const filteredVideos = filter === "all" ? VIDEOS : VIDEOS.filter(v => v.category === filter);

  const copyPrompt = (filename: string, prompt: string) => {
    navigator.clipboard.writeText(prompt);
    setCopiedPrompt(filename);
    setTimeout(() => setCopiedPrompt(null), 2000);
  };

  const togglePlay = (filename: string) => {
    const video = document.getElementById(`video-${filename}`) as HTMLVideoElement;
    if (video) {
      if (playingVideo === filename) {
        video.pause();
        setPlayingVideo(null);
      } else {
        if (playingVideo) {
          const prevVideo = document.getElementById(`video-${playingVideo}`) as HTMLVideoElement;
          prevVideo?.pause();
        }
        video.play();
        setPlayingVideo(filename);
      }
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/">
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-amber-500">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-amber-500">Video Gallery</h1>
        </div>

        <div className="flex gap-2 mb-6 flex-wrap">
          {categories.map(cat => (
            <Button
              key={cat}
              variant={filter === cat ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(cat)}
              className={filter === cat ? "bg-amber-600 hover:bg-amber-700" : "border-border"}
            >
              {cat === "all" ? "All Videos" : cat}
            </Button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredVideos.map((video) => (
            <div key={video.filename} className="bg-card rounded-lg overflow-hidden border border-border">
              <div className="relative aspect-video bg-black">
                <video
                  id={`video-${video.filename}`}
                  src={`/videos/${video.filename}`}
                  className="w-full h-full object-cover"
                  loop
                  muted
                  playsInline
                  onClick={() => togglePlay(video.filename)}
                />
                <button
                  onClick={() => togglePlay(video.filename)}
                  className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors"
                >
                  {playingVideo === video.filename ? (
                    <Pause className="w-12 h-12 text-white/80" />
                  ) : (
                    <Play className="w-12 h-12 text-white/80" />
                  )}
                </button>
              </div>
              
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-amber-400">{video.title}</h3>
                  <span className="text-xs px-2 py-1 bg-border rounded text-muted-foreground">{video.category}</span>
                </div>
                <p className="text-xs text-muted-foreground mb-3 font-mono">{video.filename}</p>
                
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-muted-foreground uppercase tracking-wider">Prompt</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyPrompt(video.filename, video.prompt)}
                        className="h-6 px-2 text-xs"
                      >
                        {copiedPrompt === video.filename ? (
                          <Check className="w-3 h-3 text-green-500" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-foreground bg-border/50 p-2 rounded max-h-32 overflow-y-auto">
                      {video.prompt}
                    </p>
                  </div>
                  
                  <div>
                    <span className="text-xs text-muted-foreground uppercase tracking-wider">Negative Prompt</span>
                    <p className="text-xs text-muted-foreground bg-border/30 p-2 rounded mt-1">
                      {video.negativePrompt}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
