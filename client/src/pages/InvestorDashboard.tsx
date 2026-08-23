import { useEffect } from 'react';

export default function InvestorDashboard() {
  useEffect(() => {
    window.location.replace('/business?tab=investor');
  }, []);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <p className="text-muted-foreground">Redirecting to Business HQ...</p>
    </div>
  );
}
