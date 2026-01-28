import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { useGame } from "@/hooks/useGameSession";
import { Archive as ArchiveIcon, Lock, Unlock, FileText, Eye, Skull, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ArchivedFile {
  id: string;
  name: string;
  classification: "PUBLIC" | "CLASSIFIED" | "REDACTED" | "VOID";
  content: string;
  requiredClues: number;
}

const ARCHIVED_FILES: ArchivedFile[] = [
  {
    id: "doc-001",
    name: "employee_manifest.txt",
    classification: "PUBLIC",
    content: "SYSADMIN CORP - EMPLOYEE ROSTER\n================================\nTotal Employees: [REDACTED]\nActive Terminals: 847\nCompromised Systems: 0 (officially)\n\nNote: All personnel are monitored 24/7.\nYour productivity is our priority.",
    requiredClues: 0
  },
  {
    id: "doc-002", 
    name: "incident_report_2024.log",
    classification: "CLASSIFIED",
    content: "INCIDENT REPORT #2024-0847\n==========================\nDate: [TEMPORAL ANOMALY]\nLocation: Sector 7-G\n\nDescription: Employee discovered hidden terminal.\nResolution: Memory adjustment applied.\nStatus: CONTAINED\n\nNote: The void watches. The void remembers.",
    requiredClues: 2
  },
  {
    id: "doc-003",
    name: "project_oracle.enc",
    classification: "REDACTED",
    content: "PROJECT: ORACLE\n===============\nObjective: [████████████]\nStatus: [████] ACTIVE [████]\n\nPhase 1: Data Collection... COMPLETE\nPhase 2: Pattern Recognition... COMPLETE  \nPhase 3: Probability Manipulation... IN PROGRESS\n\nWARNING: Quantum entanglement detected.\nThe observer changes the observed.",
    requiredClues: 4
  },
  {
    id: "doc-004",
    name: "the_truth.void",
    classification: "VOID",
    content: "Y O U  A R E  N O T  A L O N E\n\nEvery keystroke is recorded.\nEvery click is analyzed.\nEvery thought is... anticipated.\n\nThe corporation is a facade.\nThe terminal is a window.\nThe void is... waiting.\n\n> CONGRATULATIONS, SEEKER.\n> You have glimpsed behind the curtain.\n> But seeing is not understanding.\n> Understanding is not escaping.\n\nCOORDINATES: 37.7749° N, 122.4194° W\nTIMESTAMP: [WHEN YOU ARE READY]",
    requiredClues: 6
  }
];

export default function Archive() {
  const { gameState, collectClue, hasClue } = useGame();
  const [selectedFile, setSelectedFile] = useState<ArchivedFile | null>(null);
  const [glitchText, setGlitchText] = useState(false);

  const clueCount = gameState.inventory.length;

  useEffect(() => {
    const glitchInterval = setInterval(() => {
      if (Math.random() > 0.9) {
        setGlitchText(true);
        setTimeout(() => setGlitchText(false), 150);
      }
    }, 3000);
    return () => clearInterval(glitchInterval);
  }, []);

  const canAccessFile = (file: ArchivedFile) => clueCount >= file.requiredClues;

  const handleViewFile = (file: ArchivedFile) => {
    if (!canAccessFile(file)) return;
    setSelectedFile(file);
    
    const clueId = `archive-${file.id}`;
    if (!hasClue(clueId)) {
      collectClue({
        id: clueId,
        name: `Archive: ${file.name}`,
        description: `Accessed classified file from the archive.`,
        content: file.content.substring(0, 100) + "...",
        foundAt: new Date().toISOString()
      });
    }
  };

  const getClassColor = (classification: ArchivedFile["classification"]) => {
    switch (classification) {
      case "PUBLIC": return "text-green-500 border-green-900/50";
      case "CLASSIFIED": return "text-yellow-500 border-yellow-900/50";
      case "REDACTED": return "text-red-500 border-red-900/50";
      case "VOID": return "text-purple-500 border-purple-900/50";
    }
  };

  return (
    <div className="min-h-screen bg-[#050200] text-stone-300 font-mono relative overflow-hidden">
      {/* Background static effect */}
      <div className="fixed inset-0 opacity-5 pointer-events-none">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyIiBoZWlnaHQ9IjIiPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiNmZmYiLz48L3N2Zz4=')] animate-pulse" />
      </div>

      {/* Header */}
      <header className="border-b border-amber-900/30 bg-[#0a0500]/90 backdrop-blur-sm relative z-10">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ArchiveIcon className="w-6 h-6 text-amber-600" />
            <h1 className={`font-orbitron text-xl font-bold ${glitchText ? 'text-red-500' : ''}`}>
              <span className="text-amber-600">DATA</span> ARCHIVE
            </h1>
          </div>
          <Link href="/">
            <Button variant="ghost" className="text-stone-500 hover:text-amber-500" data-testid="link-home">
              <ArrowLeft className="w-4 h-4 mr-2" /> Return
            </Button>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8 relative z-10">
        {/* Access Level Indicator */}
        <div className="mb-8 p-4 bg-[#0a0500] border border-amber-900/30 rounded-lg">
          <p className="text-amber-600 text-sm">
            ACCESS LEVEL: <span className="text-amber-500 font-bold">{clueCount} DATA FRAGMENTS</span>
          </p>
          <p className="text-stone-600 text-xs mt-1">
            Collect more fragments to unlock classified documents.
          </p>
        </div>

        {/* File Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {ARCHIVED_FILES.map(file => {
            const accessible = canAccessFile(file);
            return (
              <motion.div
                key={file.id}
                whileHover={accessible ? { scale: 1.02 } : {}}
                className={`cursor-pointer ${!accessible ? 'opacity-50' : ''}`}
                onClick={() => handleViewFile(file)}
              >
                <Card className={`bg-[#0a0500] ${getClassColor(file.classification)} transition-all hover:shadow-lg`} data-testid={`card-file-${file.id}`}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-amber-500 text-sm font-mono flex items-center gap-2">
                        <FileText className="w-4 h-4" /> {file.name}
                      </CardTitle>
                      {accessible ? (
                        <Unlock className="w-4 h-4 text-green-600" />
                      ) : (
                        <Lock className="w-4 h-4 text-red-600" />
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className={`text-xs mb-2 ${getClassColor(file.classification).split(' ')[0]}`}>
                      [{file.classification}]
                    </div>
                    {accessible ? (
                      <p className="text-stone-500 text-xs">Click to access file contents...</p>
                    ) : (
                      <p className="text-red-600 text-xs">
                        LOCKED - Requires {file.requiredClues} data fragments
                      </p>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* File Viewer Modal */}
      <AnimatePresence>
        {selectedFile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
            onClick={() => setSelectedFile(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-[#0a0500] border border-amber-900/50 rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-amber-600 font-orbitron flex items-center gap-2">
                  <Eye className="w-5 h-5" /> {selectedFile.name}
                </h3>
                <span className={`text-xs ${getClassColor(selectedFile.classification).split(' ')[0]}`}>
                  [{selectedFile.classification}]
                </span>
              </div>
              
              <pre className="bg-black/50 p-4 rounded text-sm text-stone-400 whitespace-pre-wrap font-mono border border-amber-900/20">
                {selectedFile.content}
              </pre>

              <Button 
                onClick={() => setSelectedFile(null)}
                className="mt-4 w-full bg-amber-700 hover:bg-amber-600 text-black"
                data-testid="button-close-file"
              >
                Close Document
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Decorative skull for VOID classification */}
      {selectedFile?.classification === "VOID" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.1 }}
          className="fixed bottom-10 right-10 pointer-events-none"
        >
          <Skull className="w-32 h-32 text-purple-600" />
        </motion.div>
      )}
    </div>
  );
}
