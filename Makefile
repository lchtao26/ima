.PHONY: help install build dev link unlink install-global clean run

help:
	@echo "ima — local image gallery CLI"
	@echo ""
	@echo "Usage:"
	@echo "  make install         Install npm dependencies"
	@echo "  make build           Compile TypeScript to dist/"
	@echo "  make dev             Watch and rebuild on changes"
	@echo "  make link            Link 'ima' command globally (npm link)"
	@echo "  make unlink          Remove global 'ima' command"
	@echo "  make install-global  Install 'ima' globally (npm install -g .)"
	@echo "  make setup           install + build + link"
	@echo "  make run DIR=.       Run ima on a directory (default: .)"
	@echo "  make clean           Remove dist/ and node_modules/"

install:
	npm install

build: install
	npm run build

dev: install
	npm run dev

link: build
	npm link

unlink:
	-npm unlink -g ima

install-global: build
	npm install -g .

setup: unlink link

run: build
	node dist/index.js $(DIR)

clean:
	rm -rf dist node_modules
