build both containers (from their respective root directories)

docker build -t bff-service .
docker build -t data-service .

Then, create a bridge network, and run them both up, connected together.

docker network create mc1
docker run --rm -it --network mc1 --name data-service data-service
docker run --rm -it --network mc1 -e DATA_SOURCE_HOST='data-service' -e DATA_SOURCE_PORT='4000' -e DATA_SOURCE_PROTOCOL='http' -p 3000:3000 --name bff-service bff-service

curl localhost:4000/data




docker ps should look something like:
f4f0cdc0809e   bff-service   "docker-entrypoint.s…"   5 min...         0.0.0.0:3000->3000/tcp          bff-service
df9330651693   data-service  "docker-entrypoint.s…"   7 min...         4000/tcp                        data-service
