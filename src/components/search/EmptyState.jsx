import { HardDrive } from "lucide-react";

export const EmptyState = ({ isOffline }) => {
  return (
    <div className="py-10">
      <span className="mb-12 text-xs text-foreground/60 font-bold uppercase">
        ZERO ADS | NO POP-UPS | ONLY CONTENT
      </span>
      <h2 className="text-5xl font-serif lg:text-8xl font-medium my-4 tracking-tighter">
        Read Without <span className="text-[#F76F53] italic">Distractions</span>
      </h2>
      <p className="text-lg text-foreground/60">
        Enter a URL to convert web content into a beautiful reading experience
      </p>
      {isOffline && (
        <p className="text-sm text-yellow-600 mt-2">
          <HardDrive className="inline w-4 h-4 mr-1" />
          You are offline. Showing cached articles.
        </p>
      )}
    </div>
  );
};
