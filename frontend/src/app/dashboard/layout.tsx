import LiveTicker from "../../components/LiveTicker";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-950">
      <LiveTicker />
      <div className="flex flex-col md:flex-row">{children}</div>
    </div>
  );
}