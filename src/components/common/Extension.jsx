export default function Extension() {
  return (
    <section className="mt-8 mx-auto">
      <div>
        {/* <p className="text-gray-600 mt-2">
                  If you prefer RWD as a browser extension
                </p> */}
        <div className="flex justify-center items-start gap-4 mt-4">
          <a
            href="https://addons.mozilla.org/en-US/firefox/addon/rwd"
            target="_blank"
            className="rounded-full border border-border flex items-center gap-2 bg-none pl-2 pr-4 py-1 hover:text-orange-400 text-foreground transition-all duration-200 backdrop-blur-sm cursor-pointer text-sm"
            aria-label="Add this addon to Firefox"
          >
            <img src="/firefox.png" alt="Firefox logo" className="h-6" />
            <span className="py-2 text-xs font-medium">Firefox Addon</span>
          </a>
          <a
            href="https://microsoftedge.microsoft.com/addons/detail/rwd-read-without-distra/annfogckiiohmaejfkboadjnfkollake"
            target="_blank"
            className="rounded-full border border-border cursor-pointer flex items-center gap-2 bg-none pl-2 pr-4 py-1 text-foreground transition-all hover:text-blue-400  duration-200 backdrop-blur-sm text-sm"
            aria-label="Add this extension to Edge"
          >
            <img src="/edge.svg" alt="Edge logo" className="h-6" />
            <span className="py-2 text-xs font-medium">Edge Extension</span>
          </a>
          {/* <a
            href="#"
            className="rounded-full border border-border flex items-center gap-2 bg-none pl-1.5 pr-4 py-1 text-foreground transition-all duration-200 backdrop-blur-sm cursor-default text-sm"
            aria-label="Add this extension to Firefox"
          >
            <img
              src="/chrome.png"
              alt="Chrome logo"
              className="h-6 grayscale"
            />
            <span className="py-2 text-xs font-medium opacity-30">
              Chrome Extension (soon)
            </span>
          </a> */}
        </div>
      </div>
    </section>
  );
}
