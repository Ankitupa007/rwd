// components/search/PlaceholderSection.jsx
export const PlaceholderSection = () => {
  return (
    <section className="py-18">
      <div className="border-3 border-border h-[40rem] rounded-xl p-8 space-y-6">
        <section className="max-w-lg mx-auto space-y-6">
          <div className="max-w-2xl mx-auto flex justify-between items-center">
            <div className="w-12 h-12 bg-accent rounded-full p-4"></div>
          </div>

          {[...Array(4)].map((_, i) => (
            <div key={i} className="max-w-2xl mx-auto space-y-3">
              <div className="w-full p-1 bg-accent rounded-full"></div>
              <div className="w-full p-1 bg-accent rounded-full"></div>
              <div className="w-[30vw] p-1 bg-accent rounded-full"></div>
              <div className="w-[20vw] p-1 bg-accent rounded-full"></div>
              <div className="w-[10vw] p-1 bg-accent rounded-full"></div>
            </div>
          ))}
        </section>
      </div>
    </section>
  );
};
