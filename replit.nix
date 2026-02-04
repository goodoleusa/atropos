{ pkgs }: {
  deps = [
    pkgs.gnumake
    pkgs.gcc
    pkgs.luajit
    pkgs.pkg-config
    pkgs.openssl
    pkgs.rustc
    pkgs.cargo
  ];
}
