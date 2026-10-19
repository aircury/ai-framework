# Installs and manages Proxy Diablo inside this skill folder. Everything generated
# lives in .runtime/ (gitignored, safe to delete): the app, its config, and
# environments.json. Run with:  make -C <skill folder> <target>

SHELL := /usr/bin/env bash
.SHELLFLAGS := -euo pipefail -c

SKILL_DIR := $(patsubst %/,%,$(dir $(abspath $(lastword $(MAKEFILE_LIST)))))
RUNTIME   := $(SKILL_DIR)/.runtime
APP       := $(RUNTIME)/app
DIABLO    := $(SKILL_DIR)/scripts/diablo

# Pinned to the commit of amoserlu/proxydiablo#2 (environments.json, rds-iam).
# Move to the merge commit once that PR lands.
PROXYDIABLO_REPO ?= https://github.com/amoserlu/proxydiablo.git
PROXYDIABLO_REF  ?= 26d925556b57d7341375bb390ead6b5e3e942947

.PHONY: install update stop doctor ui env-add env-list env-remove env-import-phpstorm clean help

help:
	@echo "install      clone the pinned Proxy Diablo, npm ci, build (about 2-3 minutes)"
	@echo "update       re-fetch the pinned ref and rebuild"
	@echo "stop         stop the Proxy Diablo server started from this skill"
	@echo "doctor       check Node, the build, environments and the server"
	@echo "ui           start the server and open the approval UI"
	@echo "env-add      NAME= HOST= DBUSER= [PORT= DB= PASSWORD_ENV= SSLMODE=]"
	@echo "             IAM: add AUTH=rds-iam AWSPROFILE=<profile> [REGION=]"
	@echo "env-import-phpstorm  PROJECT=<dir> [DBUSER= NAMEHINT=1 AWSPROFILE=]"
	@echo "env-list     list configured environments"
	@echo "env-remove   NAME="
	@echo "clean        delete .runtime (app, config and environments)"

install: update

# Stops the server recorded in this skill's bridge file so a rebuilt app is not shadowed by an old process.
stop:
	@node -e 'const fs=require("fs");try{const b=JSON.parse(fs.readFileSync(process.argv[1],"utf8"));if(b.pid){process.kill(b.pid);console.log("Stopped Proxy Diablo (pid "+b.pid+")")}}catch{}' "$(RUNTIME)/config/proxydiablo/bridge.json"

update: stop
	@node -e 'const [a,b]=process.versions.node.split(".").map(Number); if(!((a===20&&b>=19)||(a===22&&b>=12)||a>22)){console.error("Node 20.19+ or 22.12+ is required, found "+process.version);process.exit(1)}'
	@command -v git >/dev/null || { echo "git is required" >&2; exit 1; }
	@mkdir -p "$(APP)" "$(RUNTIME)/config"
	@cd "$(APP)" && { [ -d .git ] || git init -q; } \
	  && git fetch -q --depth 1 "$(PROXYDIABLO_REPO)" "$(PROXYDIABLO_REF)" \
	  && git checkout -q --force FETCH_HEAD
	@cd "$(APP)" && npm ci --no-audit --no-fund --loglevel=error && npm run build --silent
	@[ -f "$(RUNTIME)/environments.json" ] || echo '{"environments":[]}' > "$(RUNTIME)/environments.json"
	@echo "Installed Proxy Diablo $$(git -C "$(APP)" rev-parse --short HEAD). Next: make -C $(SKILL_DIR) env-add NAME=... HOST=... DBUSER=..."

doctor:
	@ok=1; \
	node -v | sed 's/^/node: /'; \
	if [ -d "$(APP)/dist-server" ] && [ -d "$(APP)/dist" ]; then echo "build: ok ($$(git -C "$(APP)" rev-parse --short HEAD))"; else echo "build: MISSING -> make -C $(SKILL_DIR) install"; ok=0; fi; \
	if [ "$$ok" = 1 ]; then "$(DIABLO)" pgsql profiles >/dev/null 2>&1 && echo "server: ok" || { echo "server: could not start (see $(RUNTIME)/config/proxydiablo/server.log)"; ok=0; }; fi; \
	node "$(SKILL_DIR)/scripts/envs.mjs" list "$(RUNTIME)/environments.json"; \
	[ "$$ok" = 1 ]

ui:
	@"$(DIABLO)" ui

env-add:
	@node "$(SKILL_DIR)/scripts/envs.mjs" add "$(RUNTIME)/environments.json" \
	  --name "$(NAME)" --host "$(HOST)" --user "$(DBUSER)" \
	  $(if $(PORT),--port "$(PORT)") $(if $(DB),--database "$(DB)") \
	  $(if $(PASSWORD_ENV),--password-env "$(PASSWORD_ENV)") $(if $(SSLMODE),--sslmode "$(SSLMODE)") \
	  $(if $(AUTH),--auth "$(AUTH)") $(if $(AWSPROFILE),--aws-profile "$(AWSPROFILE)") $(if $(REGION),--region "$(REGION)")

env-import-phpstorm:
	@node "$(SKILL_DIR)/scripts/envs.mjs" import-phpstorm "$(RUNTIME)/environments.json" \
	  --project "$(PROJECT)" $(if $(DBUSER),--user "$(DBUSER)") $(if $(NAMEHINT),--use-name-hint yes) \
	  $(if $(AWSPROFILE),--aws-profile "$(AWSPROFILE)") $(if $(REGION),--region "$(REGION)")

env-list:
	@node "$(SKILL_DIR)/scripts/envs.mjs" list "$(RUNTIME)/environments.json"

env-remove:
	@node "$(SKILL_DIR)/scripts/envs.mjs" remove "$(RUNTIME)/environments.json" --name "$(NAME)"

clean:
	rm -rf "$(RUNTIME)"
