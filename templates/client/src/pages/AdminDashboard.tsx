// TEMPLATE: Modular Admin Dashboard
// This file stays THIN (~100 lines) because each section is its own component.
// The pattern: define nav groups, render the active section, delegate everything else.

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

// TEMPLATE: Import admin sections — each is a standalone component
import { FeedbackSection } from "./admin/FeedbackSection";
// import { AnalyticsSection } from "./admin/AnalyticsSection";
// import { ContentSection } from "./admin/ContentSection";
// import { SettingsSection } from "./admin/SettingsSection";

// TEMPLATE: Define navigation groups
// Each group contains section IDs that map to components in renderContent()
const NAV_GROUPS = [
  {
    label: "Overview",
    items: [
      { id: "activity", label: "Activity" },
      { id: "sessions", label: "Sessions" },
    ],
  },
  {
    label: "Content",
    items: [
      { id: "campaigns", label: "Campaigns" },
      { id: "modules", label: "Modules" },
    ],
  },
  {
    label: "Communication",
    items: [
      { id: "feedback", label: "Agent Feedback" },
      // TEMPLATE: Add new nav items here
      // { id: "analytics", label: "Analytics" },
    ],
  },
  {
    label: "System",
    items: [
      { id: "config", label: "Config" },
      // { id: "settings", label: "Settings" },
    ],
  },
];

export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState("activity");

  // TEMPLATE: Map section IDs to components
  // Each case renders a self-contained admin section
  const renderContent = () => {
    switch (activeSection) {
      case 'feedback': return <FeedbackSection />;
      // TEMPLATE: Add new section renders here
      // case 'analytics': return <AnalyticsSection />;
      // case 'settings': return <SettingsSection />;
      default: return <div className="text-center py-8 opacity-50">Select a section</div>;
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Sidebar Navigation */}
      <aside className="w-56 border-r p-4">
        <h1 className="text-sm font-bold mb-4">Admin</h1>
        <ScrollArea className="flex-1">
          {NAV_GROUPS.map(group => (
            <div key={group.label} className="mb-4">
              <div className="text-[10px] uppercase tracking-wider opacity-50 mb-1">{group.label}</div>
              {group.items.map(item => (
                <Button
                  key={item.id}
                  variant={activeSection === item.id ? "secondary" : "ghost"}
                  size="sm"
                  className="w-full justify-start text-xs h-7 mb-0.5"
                  onClick={() => setActiveSection(item.id)}
                  data-testid={`nav-${item.id}`}
                >
                  {item.label}
                </Button>
              ))}
            </div>
          ))}
        </ScrollArea>
      </aside>

      {/* Content Area */}
      <main className="flex-1 p-6">
        {renderContent()}
      </main>
    </div>
  );
}
