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
            className: "border-red-500 text-red-500 bg-black"
         });
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 bg-black/50 p-8 rounded-xl border border-gray-800 backdrop-blur-sm relative overflow-hidden">
        {/* Decorative corner borders */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-green-500/50 rounded-tl-lg"></div>
        <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-green-500/50 rounded-tr-lg"></div>
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-green-500/50 rounded-bl-lg"></div>
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-green-500/50 rounded-br-lg"></div>

        <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-950/30 border border-green-900 mb-4">
                <LockKeyhole className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-3xl font-orbitron font-bold text-gray-100">
                Staff <span className="text-green-600">Portal</span>
            </h2>
            <p className="mt-2 text-sm text-gray-500">Secure Internal Access Only</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-gray-500 font-mono">Operator ID</label>
                <Input 
                    type="text" 
                    placeholder="Enter ID" 
                    className="bg-black/50 border-gray-800 text-green-500 font-mono focus:border-green-500"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
            </div>
            <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-gray-500 font-mono">Passcode</label>
                <Input 
                    type="password" 
                    placeholder="••••••••" 
                    className="bg-black/50 border-gray-800 text-green-500 font-mono focus:border-green-500"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
            </div>
            
            <Button className="w-full bg-green-700 hover:bg-green-600 text-black font-bold font-orbitron" type="submit">
                AUTHENTICATE
            </Button>
        </form>
        
        <div className="text-center text-xs text-gray-700 font-mono mt-4">
            ENCRYPTED VIA AES-256 • PROPRIETARY PROTOCOL
        </div>
      </div>
    </div>
  );
}
