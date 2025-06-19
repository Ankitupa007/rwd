"use client"
import { Button } from "@/components/ui/button"
import { useStore } from "@/lib/store";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ToggleTheme } from "../theme-toggle";
import { ArrowLeft, Download, Minus, Plus, Settings, Share, Share2 } from "lucide-react";
import { useEffect, useState } from "react";

const Header = () => {
  const { setFontSize, setFontFamily, fontSize, fontFamily, content, loading, setContent } = useStore();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const controlHeader = () => {
    if (typeof window !== 'undefined') {
      if (window.scrollY > lastScrollY) {
        // scrolling down
        setIsVisible(false);
      } else {
        // scrolling up
        setIsVisible(true);
      }
      setLastScrollY(window.scrollY);
    }
  };
  const downloadContent = () => {
    if (!content) return;
    const element = document.createElement('a');
    const file = new Blob([content.content.replace(/<[^>]*>/g, '')], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${content.title}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const shareContent = async () => {
    if (!content) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: content.title,
          text: content.title,
          url: content.url
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    }
  };
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', controlHeader);
      return () => window.removeEventListener('scroll', controlHeader);
    }
  }, [lastScrollY]);

  const adjustFontSize = (change) => {
    const newSize = Math.max(12, Math.min(28, fontSize + change));
    setFontSize(newSize);
  };

  return (
    <header className={`sticky border-b top-0 left-0 w-full z-50 transition-transform duration-300 ease-in-out ${isVisible ? 'translate-y-0' : '-translate-y-full'
      } backdrop-blur-2xl bg-background/40`}>
      <div className="max-w-4xl mx-auto px-4 lg:px-0  py-4">
        <div className="flex items-center justify-between">
          {!content || loading ? (<h1 className="text-xl font-black">rwd</h1>) : (<Button
            variant={"secondary"}
            onClick={() => setContent(null)}
            className="w-10 h-10 flex justify-center items-center rounded-full cursor-pointer"
          >
            <ArrowLeft size={16} className='' />
          </Button>)}
          <div className="flex items-center space-x-2">
            {content && !loading && (<div className="flex items-center space-x-2">
              <Button variant={"secondary"} onClick={downloadContent} className="w-10 h-10 flex justify-center items-center rounded-full cursor-pointer">
                <Download className="w-5 h-5" />
              </Button>
              <Button variant={"secondary"} onClick={shareContent} className="w-10 h-10 flex justify-center items-center rounded-full cursor-pointer">
                <Share2 className="w-5 h-5" />
              </Button>
            </div>)}
            <Popover side={"right"}>
              <PopoverTrigger asChild>
                <Button variant="default" className={"w-10 h-10 flex justify-center shadow-none items-center rounded-full cursor-pointer"}><Settings size={16} /></Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 m-4">
                <div className="px-4 py-2">
                  <div className="flex flex-wrap items-center gap-6">
                    <div className="flex items-center space-x-3">
                      <span className="text-sm font-medium">Font Size:</span>
                      <Button variant={"secondary"} className="w-10 h-10 flex justify-center items-center rounded-full cursor-pointer" onClick={() => adjustFontSize(-2)} ><Minus size={16} /></Button>
                      <span>{fontSize}px</span>
                      <Button variant={"secondary"} onClick={() => adjustFontSize(2)} className="w-10 h-10 flex justify-center items-center rounded-full cursor-pointer"><Plus size={16} /></Button>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-sm font-medium">Font:</span>
                      <Select value={fontFamily} onValueChange={setFontFamily}>
                        <SelectTrigger  className="w-[100px]">
                          <SelectValue placeholder="Font" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="serif" className="font-serif">Serif</SelectItem>
                          <SelectItem value="sans" className="font-sans">Sans-Serif</SelectItem>
                          <SelectItem value="mono" className="font-mono">Mono</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-sm font-medium">Theme</span>
                      <ToggleTheme />
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
