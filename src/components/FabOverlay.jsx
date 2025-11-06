"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";

export default function FabCornerExpand() {
  const [open, setOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const controlHeader = () => {
    if (typeof window !== "undefined") {
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

  // Prevent body scroll when overlay is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [open]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.addEventListener("scroll", controlHeader);
      return () => window.removeEventListener("scroll", controlHeader);
    }
  }, [lastScrollY]);

  return (
    <div>
      {/* Floating Action Button - Always visible */}
      <div
        className={`fixed bottom-0 right-0 w-auto p-4 transition-transform duration-300 ease-in-out ${
          isVisible ? "translate-y-0" : "translate-y-full"
        } ${open ? "z-[60]" : "z-50"}`}
      >
        <motion.button
          onClick={() => setOpen(!open)}
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-[#F76F53] text-[#f1f1f1] shadow-xl hover:bg-[#F76F53]/80 transition-all shadow-[#F76F53]/20 hover:shadow-[#F76F53]/40"
        >
          <Plus size={28} />
        </motion.button>
      </div>

      {/* Expanding Overlay */}
      <AnimatePresence>
        {open && (
          <>
            {/* Background overlay to prevent scrolling */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-background/20 md:bg-transparent"
              onClick={() => setOpen(false)}
            />

            {/* Expanding overlay */}
            <motion.div
              initial={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                bottom: 24,
                right: 24,
              }}
              animate={{
                width: "100%",
                height: "100%",
                borderRadius: "0%",
                bottom: 0,
                right: 0,
                transition: {
                  duration: 0.5,
                  ease: [0.32, 0.72, 0, 1],
                },
              }}
              exit={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                bottom: 24,
                right: 24,
                transition: {
                  duration: 0.3,
                  ease: [0.32, 0.72, 0, 1],
                },
              }}
              style={{
                // Desktop/tablet specific styles that override animation
                width: window.innerWidth >= 768 ? "400px" : undefined,
                height: window.innerWidth >= 768 ? "500px" : undefined,
                borderRadius: window.innerWidth >= 768 ? "16px" : undefined,
                bottom: window.innerWidth >= 768 ? "96px" : undefined,
                right: window.innerWidth >= 768 ? "24px" : undefined,
              }}
              className="fixed z-50 bg-secondary overflow-hidden shadow-xl md:max-w-[400px]"
            >
              {/* Scrollable content area */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{
                  opacity: 1,
                  transition: { delay: 0.3, duration: 0.3 },
                }}
                exit={{
                  opacity: 0,
                  transition: { duration: 0.2 },
                }}
                className="h-full overflow-y-auto"
              >
                <div className="min-h-full flex flex-col p-8">
                  <div className="mb-8">
                    <h1 className="text-3xl font-serif text-foreground">
                      My Notes
                    </h1>
                  </div>

                  <div className="flex-1 text-foreground space-y-4">
                    <p className="text-lg">Add your notes here...</p>

                    {/* Sample scrollable content */}
                    <div className="space-y-4 mt-8 font-serif">
                      {[...Array(10)].map((_, i) => (
                        <div
                          key={i}
                          className="bg-foreground/10 rounded-lg p-4 backdrop-blur-sm"
                        >
                          <h3 className="font-semibold mb-2">Note {i + 1}</h3>
                          <p className="text-foreground/80">
                            This is a sample note. The content inside this
                            overlay is scrollable while the background remains
                            fixed.
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
