import { useState } from "react";
import { Link } from "wouter";
import { GlitchText } from "@/components/GlitchText";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LockKeyhole } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { toast } = useToast();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Fake login logic
    if (username === "admin" && password === "admin") {
         toast({
            title: "ACCESS DENIED",
            description: "Nice try, script kiddie. This incident has been reported.",
            variant: "destructive",
         });
    } else {
        toast({
            title: "INVALID CREDENTIALS",
            description: "Authentication server is rejecting your handshake.",
            variant: "default",
            className: "border-red-500 text-red-500 bg-card"
         });
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 bg-card p-8 rounded-xl border border-border shadow-lg relative overflow-hidden">
        {/* Decorative corner borders */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-emerald-600/50 rounded-tl-lg"></div>
        <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-emerald-600/50 rounded-tr-lg"></div>
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-emerald-600/50 rounded-bl-lg"></div>
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-emerald-600/50 rounded-br-lg"></div>

        <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 border border-emerald-300 mb-4">
                <LockKeyhole className="w-8 h-8 text-emerald-700" />
            </div>
            <h2 className="text-3xl font-orbitron font-bold text-foreground">
                Staff <span className="text-emerald-700">Portal</span>
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">Secure Internal Access Only</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-muted-foreground font-mono">Operator ID</label>
                <Input
                    type="text"
                    placeholder="Enter ID"
                    className="bg-background border-border text-emerald-700 font-mono focus:border-emerald-600"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
            </div>
            <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-muted-foreground font-mono">Passcode</label>
                <Input
                    type="password"
                    placeholder="••••••••"
                    className="bg-background border-border text-emerald-700 font-mono focus:border-emerald-600"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
            </div>

            <Button className="w-full bg-emerald-700 hover:bg-emerald-600 text-white font-bold font-orbitron" type="submit">
                AUTHENTICATE
            </Button>
        </form>

        <div className="text-center text-xs text-muted-foreground font-mono mt-4">
            ENCRYPTED VIA AES-256 • PROPRIETARY PROTOCOL
        </div>
      </div>
    </div>
  );
}
