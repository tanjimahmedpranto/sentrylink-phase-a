import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto max-w-4xl p-6">
      <h1 className="text-3xl font-semibold">SentryLink Comply Phase A</h1>
      <p className="mt-2 text-gray-700">
        Mock UI showing Evidence Vault and Buyer Request fulfillment for a
        Factory user.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Link
          href="/evidence"
          className="rounded-lg border p-4 hover:bg-gray-50"
        >
          <div className="text-lg font-semibold">Evidence Vault</div>
          <div className="text-sm text-gray-600">
            Filter, search, bulk select, view versions, upload new version.
          </div>
        </Link>

        <Link
          href="/requests"
          className="rounded-lg border p-4 hover:bg-gray-50"
        >
          <div className="text-lg font-semibold">Buyer Request To Do</div>
          <div className="text-sm text-gray-600">
            Fulfill using existing evidence or create new evidence.
          </div>
        </Link>
      </div>
    </main>
  );
}
