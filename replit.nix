{ pkgs }: {
  deps = [
    pkgs.argus
    pkgs.theharvester
    pkgs.httpx
    pkgs.nuclei
    pkgs.amass
    pkgs.subfinder
    pkgs.ffuf
    pkgs.gobuster
    pkgs.masscan
    pkgs.nikto
    pkgs.dig
    pkgs.whois
    pkgs.nmap
    pkgs.gnumake
    pkgs.gcc
    pkgs.luajit
    pkgs.pkg-config
    pkgs.openssl
    pkgs.rustc
    pkgs.cargo
  ];
}
