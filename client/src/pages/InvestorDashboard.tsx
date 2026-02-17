import { useEffect } from 'react';

export default function InvestorDashboard() {
  useEffect(() => {
    window.location.replace('/business?tab=investor');
  }, []);

  return (
    <div className="min-h-screen bg-stone-950 flex items-center justify-center">
      <p className="text-stone-400">Redirecting to Business HQ...</p>
    </div>
  );
}
