SERVERLESS := SLS_DEBUG=* node_modules/.bin/serverless
DATABASE ?= comfy

export PGUSER ?= postgres
export PGHOST ?= localhost

install:
	npm i

install-db:
	docker run --name comfy-db -p 5432:5432 -d postgres:9.6
	sleep 5s
	psql -c "CREATE DATABASE ${DATABASE}"
	psql ${DATABASE} < var/schema.sql

start-db:
	docker start comfy-db

stop-db:
	docker stop comfy-db

run:
	$(SERVERLESS) offline --location=.webpack --host=0.0.0.0 --port=3000

deploy:
	NODE_ENV=production $(SERVERLESS) deploy

undeploy:
	NODE_ENV=production $(SERVERLESS) remove

test:
	NODE_ENV=test ./node_modules/.bin/mocha --compilers js:babel-core/register --opts ./mocha.opts "src/**/*.spec.js"