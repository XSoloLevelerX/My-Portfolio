/**
 * The CSS armillary. One artefact doing three jobs, per the spec:
 * it is the server-rendered first paint, the no-WebGL fallback, and the
 * loading state. The WebGL rings cross-fade over it in the same position,
 * so the swap is invisible and nothing shifts.
 */
export default function CssArmillary() {
  return (
    <div
      className="pointer-events-none absolute inset-0 flex items-center justify-center lg:justify-end lg:pr-[22%]"
      aria-hidden="true"
    >
      {/* Width and offset track the WebGL rings at camera z=9.4 so the
          cross-fade does not jump. */}
      <div className="relative aspect-square w-[min(38vh,38%)]">
        <div className="css-armillary-spin absolute inset-0">
          <div className="absolute inset-0 rounded-full border border-[color:var(--brass)] opacity-70" />
          <div
            className="absolute inset-0 rounded-full border border-[color:var(--brass)] opacity-60"
            style={{ transform: "scaleY(0.32)" }}
          />
          <div
            className="absolute inset-0 rounded-full border border-[color:var(--brass)] opacity-60"
            style={{ transform: "scaleX(0.28)" }}
          />
        </div>
        <div
          className="absolute left-1/2 top-1/2 h-[9%] w-[9%] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-90"
          style={{ background: "var(--brass)" }}
        />
      </div>
    </div>
  );
}
