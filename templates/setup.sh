#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MANIFEST="$SCRIPT_DIR/manifest.json"

RED='\033[0;31m'
GREEN='\033[0;32m'
AMBER='\033[0;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

header() {
  echo ""
  echo -e "${AMBER}╔══════════════════════════════════════════╗${NC}"
  echo -e "${AMBER}║  ${BOLD}ATROPOS STARTER KIT${NC}${AMBER}                    ║${NC}"
  echo -e "${AMBER}║  Modular Cybersecurity Training Platform ║${NC}"
  echo -e "${AMBER}╚══════════════════════════════════════════╝${NC}"
  echo ""
}

show_presets() {
  echo -e "${BOLD}Available Presets:${NC}"
  echo ""
  echo -e "  ${CYAN}1)${NC} ${BOLD}minimal${NC}    — Core platform + terminal"
  echo -e "  ${CYAN}2)${NC} ${BOLD}learner${NC}    — Campaigns, AI agents, gamification, wiki"
  echo -e "  ${CYAN}3)${NC} ${BOLD}civic${NC}      — Civic engagement, grassroots organizing, movement history"
  echo -e "  ${CYAN}4)${NC} ${BOLD}security${NC}   — OSINT tools, scanning, reports, investigations"
  echo -e "  ${CYAN}5)${NC} ${BOLD}marketing${NC}  — Behavior analysis, engagement, reporting"
  echo -e "  ${CYAN}6)${NC} ${BOLD}full${NC}       — Everything included"
  echo -e "  ${CYAN}7)${NC} ${BOLD}custom${NC}     — Pick individual modules"
  echo ""
}

show_modules() {
  echo -e "${BOLD}Available Modules:${NC}"
  echo ""
  local i=1
  for dir in "$SCRIPT_DIR"/modules/*/; do
    local mod_name=$(basename "$dir")
    local mod_json="$dir/module.json"
    if [ -f "$mod_json" ]; then
      local name=$(python3 -c "import json; print(json.load(open('$mod_json'))['name'])" 2>/dev/null || echo "$mod_name")
      local desc=$(python3 -c "import json; print(json.load(open('$mod_json'))['description'])" 2>/dev/null || echo "")
      echo -e "  ${CYAN}$i)${NC} ${BOLD}$mod_name${NC}"
      echo -e "     ${desc}"
    fi
    i=$((i + 1))
  done
  echo ""
}

get_preset_modules() {
  local preset="$1"
  case "$preset" in
    1|minimal)    echo "terminal" ;;
    2|learner)    echo "nexus-ai terminal campaigns gamification wiki" ;;
    3|civic)      echo "nexus-ai terminal campaigns civic-engagement gamification wiki" ;;
    4|security)   echo "nexus-ai terminal scanner-osint spiderfoot report-builder portfolio" ;;
    5|marketing)  echo "behavior-analysis gamification report-builder" ;;
    6|full)       echo "nexus-ai terminal campaigns civic-engagement scanner-osint qr-c2 gamification behavior-analysis report-builder portfolio ai-lab wiki spiderfoot crew-builder" ;;
    *)            echo "" ;;
  esac
}

resolve_dependencies() {
  local modules=($@)
  local resolved=()
  local changed=true

  while $changed; do
    changed=false
    for mod in "${modules[@]}"; do
      local mod_json="$SCRIPT_DIR/modules/$mod/module.json"
      if [ -f "$mod_json" ]; then
        local deps=$(python3 -c "
import json
m = json.load(open('$mod_json'))
deps = m.get('inject', {}).get('dependencies', [])
if not deps:
    deps = []
for d in deps:
    print(d)
" 2>/dev/null)
        for dep in $deps; do
          if [[ ! " ${modules[*]} " =~ " ${dep} " ]]; then
            modules+=("$dep")
            changed=true
            echo -e "  ${AMBER}+ Adding dependency:${NC} $dep (required by $mod)"
          fi
        done
      fi
    done
  done
  echo "${modules[@]}"
}

assemble_project() {
  local target="$1"
  shift
  local modules=($@)

  echo -e "${GREEN}Assembling project at: ${BOLD}$target${NC}"
  echo ""

  mkdir -p "$target"

  echo -e "  ${CYAN}[base]${NC} Copying core platform files..."
  cp -r "$SCRIPT_DIR/base/"* "$target/" 2>/dev/null || true

  local schema_additions=""
  local nav_user_additions=""
  local nav_admin_additions=""
  local app_imports=""
  local app_routes=""
  local route_imports=""
  local route_registers=""
  local env_keys=""

  for mod in "${modules[@]}"; do
    local mod_dir="$SCRIPT_DIR/modules/$mod"
    local mod_json="$mod_dir/module.json"

    if [ ! -f "$mod_json" ]; then
      echo -e "  ${RED}[skip]${NC} Module '$mod' not found"
      continue
    fi

    local mod_name=$(python3 -c "import json; print(json.load(open('$mod_json'))['name'])" 2>/dev/null || echo "$mod")
    echo -e "  ${GREEN}[+]${NC} Adding module: ${BOLD}$mod_name${NC}"

    if [ -f "$mod_dir/schema.ts" ]; then
      schema_additions="$schema_additions\n// --- Module: $mod ---\n$(cat "$mod_dir/schema.ts")\n"
    fi

    local inject=$(cat "$mod_json")

    local nav_items=$(echo "$inject" | python3 -c "
import json, sys
data = json.load(sys.stdin)
items = data.get('inject', {}).get('nav_items', [])
for item in items:
    section = item.get('section', 'user')
    print(f\"{section}|{item['path']}|{item['icon']}|{item['label']}|{item['color']}\")
" 2>/dev/null)

    while IFS='|' read -r section path icon label color; do
      [ -z "$section" ] && continue
      local entry="    { path: '$path', icon: $icon, label: '$label', color: '$color' },"
      if [ "$section" = "user" ]; then
        nav_user_additions="$nav_user_additions\n$entry"
      else
        nav_admin_additions="$nav_admin_additions\n$entry"
      fi
    done <<< "$nav_items"

    local app_imp=$(echo "$inject" | python3 -c "import json, sys; d=json.load(sys.stdin); v=d.get('inject',{}).get('app_import'); print(v if v else '')" 2>/dev/null)
    [ -n "$app_imp" ] && app_imports="$app_imports\n$app_imp"

    local app_rt=$(echo "$inject" | python3 -c "import json, sys; d=json.load(sys.stdin); v=d.get('inject',{}).get('app_route'); print(v if v else '')" 2>/dev/null)
    [ -n "$app_rt" ] && app_routes="$app_routes\n      $app_rt"

    local rt_imp=$(echo "$inject" | python3 -c "import json, sys; d=json.load(sys.stdin); v=d.get('inject',{}).get('routes_import'); print(v if v else '')" 2>/dev/null)
    [ -n "$rt_imp" ] && route_imports="$route_imports\n$rt_imp"

    local rt_reg=$(echo "$inject" | python3 -c "import json, sys; d=json.load(sys.stdin); v=d.get('inject',{}).get('routes_register'); print(v if v else '')" 2>/dev/null)
    [ -n "$rt_reg" ] && route_registers="$route_registers\n  $rt_reg"

    local ek=$(echo "$inject" | python3 -c "import json, sys; d=json.load(sys.stdin); keys=d.get('inject',{}).get('env_keys',[]); print(' '.join(keys))" 2>/dev/null)
    [ -n "$ek" ] && env_keys="$env_keys $ek"
  done

  if [ -n "$schema_additions" ]; then
    echo -e "$schema_additions" >> "$target/shared/schema.ts"
  fi

  if [ -f "$target/client/src/config/navConfig.ts" ]; then
    if [ -n "$nav_user_additions" ]; then
      sed -i "s|/\* MODULE_USER_NAV \*/|$(echo -e "$nav_user_additions")\n    /* MODULE_USER_NAV */|" "$target/client/src/config/navConfig.ts" 2>/dev/null || true
    fi
    if [ -n "$nav_admin_additions" ]; then
      sed -i "s|/\* MODULE_ADMIN_NAV \*/|$(echo -e "$nav_admin_additions")\n    /* MODULE_ADMIN_NAV */|" "$target/client/src/config/navConfig.ts" 2>/dev/null || true
    fi
  fi

  if [ -f "$target/client/src/App.tsx" ]; then
    if [ -n "$app_imports" ]; then
      sed -i "s|/\* MODULE_IMPORTS \*/|$(echo -e "$app_imports")\n/* MODULE_IMPORTS */|" "$target/client/src/App.tsx" 2>/dev/null || true
    fi
    if [ -n "$app_routes" ]; then
      sed -i "s|{/\* MODULE_ROUTES \*/}|$(echo -e "$app_routes")\n      {/* MODULE_ROUTES */}|" "$target/client/src/App.tsx" 2>/dev/null || true
    fi
  fi

  echo ""
  if [ -n "$env_keys" ]; then
    echo -e "${AMBER}Required environment variables:${NC}"
    for key in $env_keys; do
      echo -e "  - $key"
    done
    echo ""
  fi

  local mod_count=${#modules[@]}
  echo -e "${GREEN}${BOLD}Done!${NC} Assembled base + ${mod_count} modules into ${BOLD}$target${NC}"
  echo ""
  echo -e "Next steps:"
  echo -e "  1. Copy files into your project"
  echo -e "  2. Run ${CYAN}npm install${NC}"
  echo -e "  3. Run ${CYAN}npm run db:push${NC} to create database tables"
  echo -e "  4. Set any required environment variables"
  echo -e "  5. Run ${CYAN}npm run dev${NC}"
}

header

if [ -n "$1" ]; then
  PRESET="$1"
  TARGET="${2:-./_assembled}"
  MODULES=$(get_preset_modules "$PRESET")
  if [ -z "$MODULES" ]; then
    echo -e "${RED}Unknown preset: $PRESET${NC}"
    show_presets
    exit 1
  fi
  assemble_project "$TARGET" $MODULES
  exit 0
fi

show_presets
read -p "Choose a preset (1-7): " choice

if [ "$choice" = "7" ]; then
  show_modules
  echo -e "Enter module names separated by spaces (e.g., ${CYAN}nexus-ai terminal gamification${NC}):"
  read -p "> " custom_modules
  MODULES="$custom_modules"
else
  MODULES=$(get_preset_modules "$choice")
fi

if [ -z "$MODULES" ]; then
  echo -e "${RED}No modules selected.${NC}"
  exit 1
fi

read -p "Output directory [./_assembled]: " target_dir
target_dir="${target_dir:-./_assembled}"

echo ""
echo -e "${BOLD}Selected modules:${NC} $MODULES"
echo ""

assemble_project "$target_dir" $MODULES
