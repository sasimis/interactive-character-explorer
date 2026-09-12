export function HUD({ action }: { action: string }) {
  return (
    <div className="pointer-events-none fixed inset-0 z-10 select-none">
      <div className="flex items-start justify-between p-5">
        <div className="rounded-xl bg-card/80 px-4 py-3 text-card-foreground shadow-lg backdrop-blur">
          <h1 className="text-lg font-semibold tracking-tight">Meet the Robot</h1>
          <p className="text-sm text-muted-foreground">
            It watches your cursor — then walk it around the meadow.
          </p>
        </div>
        <div className="rounded-xl bg-card/80 px-4 py-2 font-mono text-sm text-card-foreground shadow-lg backdrop-blur">
          {action}
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 flex flex-wrap justify-center gap-2 p-5">
        {[
          ["W A S D", "move"],
          ["Shift", "run"],
          ["Space", "jump"],
          ["E", "wave"],
          ["F", "dance"],
          ["Drag", "turn camera"],
        ].map(([key, label]) => (
          <div
            key={key}
            className="rounded-lg bg-card/80 px-3 py-1.5 text-xs text-card-foreground shadow backdrop-blur"
          >
            <span className="font-semibold">{key}</span>{" "}
            <span className="text-muted-foreground">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
