import { ImportPanel } from "./ImportPanel";

export const dynamic = "force-dynamic";

export default function AdminImportPage() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Import cafes</h2>
        <p className="text-sm text-ink-muted">
          Add real cafes from OpenStreetMap to grow coverage in a city.
        </p>
      </div>
      <ImportPanel />
    </div>
  );
}
