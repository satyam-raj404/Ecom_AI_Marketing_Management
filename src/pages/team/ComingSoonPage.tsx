import { Link } from "react-router-dom";
import { Construction } from "lucide-react";

// Placeholder for pages built in later phases
export default function ComingSoonPage({ title, phase }: { title: string; phase: number }) {
  return (
    <div className="card text-center py-16">
      <Construction className="mx-auto text-marigold" size={40} />
      <h1 className="mt-4 text-2xl text-ledger">{title}</h1>
      <p className="mt-2 text-sm text-ledger/60">Shipping in Phase {phase}.</p>
      <Link to="/team" className="btn-secondary mt-6 inline-flex">Back to Dashboard</Link>
    </div>
  );
}
