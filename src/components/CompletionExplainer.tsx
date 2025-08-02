export function CompletionExplainer() {
  return (
    <div className="p-5 w-full rounded-md border bg-background border-foreground-20">
      <h3 className="font-semibold mb-4 text-foreground">
        How to confirm completions:
      </h3>
      
      <div className="flex flex-col md:flex-row md:gap-8 space-y-4 md:space-y-0">
        <div className="flex-1 space-y-2">
          <h4 className="font-medium text-foreground text-sm">Desktop</h4>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-8 rounded border bg-foreground-10 border-foreground-20 text-xs font-medium text-foreground-50">
              ⇥
            </div>
            <span className="text-sm text-foreground-50">
              Press Tab key
            </span>
          </div>
        </div>

        <div className="flex-1 space-y-2">
          <h4 className="font-medium text-foreground text-sm">Mobile</h4>
          <div className="flex items-center gap-3">
            <span className="text-sm text-foreground-50">
              Not supported yet
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
