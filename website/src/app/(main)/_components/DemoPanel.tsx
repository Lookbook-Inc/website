import OutfitAnalyzer from "./OutfitAnalyzer";

export function DemoPanel() {
  return (
    <section className="h-screen w-full snap-start p-2 md:p-4">
      <div className="relative h-full w-full rounded-[2.5rem] md:rounded-[3.5rem] overflow-y-auto bg-white border border-black/5 p-8 md:p-12">
        <OutfitAnalyzer />
      </div>
    </section>
  );
}
