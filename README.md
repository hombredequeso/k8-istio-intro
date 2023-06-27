# Various Service Deployments

This illustrates running the same basic system of a pseudo backend-for-front-end api getting data from a data service in 5 different ways:

* locally
* docker
* docker compose
* kubernetes
* kubernetes + ISTIO

Key features are:
* work through from what is possibly familar (docker) through to the new thing (istio)
* for each variation, do as little as possible with as little as possible in order to achieve the same result.

This works on a Mac. Specifically, it means that the commands required to get access to the Kubernetes cluster running in minikube running in Docker on a Mac are included.

# Prerequisites

* `pnpm` and `node` installed
* docker (tested with version 24.0.2)
* docker compose (usually going to come with docker) (tested with version 2.18.1)
* [minikube](https://minikube.sigs.k8s.io/docs/start/) (tested with minikube version: v1.30.1)
* kubectl on the path
    * try `brew install kubectl`
* istioctl on the path.
    * try downloading as per [ISTIO getting started](https://istio.io/latest/docs/setup/getting-started/), but only go as far as getting `istioctl` on the path.


# The System

The fake system that is used is a very simple backend-for-front-end REST api (bff-service) that can get data from a service REST api (data-service). The UI Client (simulator) that will be used throughout is curl.

```mermaid
C4Container
    title Simplified Multi-Service System

    System_Ext(ui_client, "UI Client (curl)")
    Container(bff_api, "bff-service", "Backend for frontend")
    Container(backend_api, "data-service", "Resource REST api")
 
 
    Rel( bff_api,backend_api, "GET /data")    
    Rel( ui_client,bff_api, "GET /data")
    UpdateLayoutConfig($c4ShapeInRow="1")
```

# Raw local

Run the services up locally. In this variation, the services are running using programs installed locally on the machine (pnpm, node).

```
cd bff-service
pnpm install
node app.js
```

```
cd data-service
pnpm install
node app.js
```

And check:
```
curl localhost:3000
curl localhost:3000/data

curl localhost:4000
curl localhost:4000/data
```

# Docker edition:

The services can also be build into docker containers, then run within the docker containers. In this variation, the services are running within a docker container, and a bridge network is created through which the services communicate.

```

cd bff-service
docker build -t bff-service:1 .

cd ../data-service
docker build -t data-service:1 .

docker network create tut
docker run --rm -it --network tut --name data-service -d data-service:1
docker run --rm -it --network tut -e DATA_SOURCE_HOST='data-service' -e DATA_SOURCE_PORT='4000' -e DATA_SOURCE_PROTOCOL='http' -p 3000:3000 --name bff-service -d bff-service:1

curl localhost:3000/data
```

docker ps should look something like:
f4f0cdc0809e   bff-service   "docker-entrypoint.s…"   5 min...         0.0.0.0:3000->3000/tcp          bff-service
df9330651693   data-service  "docker-entrypoint.s…"   7 min...         4000/tcp                        data-service

A key thing to note here is that port 3000 is accessible locally, but not 4000.
However, the bff-service can talk to the data-service because they are both on the 'tut' network.

```
docker stop bff-service data-service
```

# Docker Compose Edition

This is basically the same as the docker edition, but using `docker compose` to run up the containers and network.

One thing to note here is that the name of the DATA_SOURCE_HOST is now 'data', because that is the name of the data service in the docker-compose.yml file. What is holding everything together now is the identification of things within the docker-compose file. It isn't a service discovery service, but the docker-compose.yml file is serving the role of specifying how to discover the services on the network.

```
cd k8-istio-intro
docker compose up -d
docker network ls
docker ps
curl localhost:3000/data
docker compose down
```

# Kubernetes edition

The same docker containers build previously are loaded into minikube, and the services are run within kubernetes.

Note that access to the bff-service is accessed by creating it as a nodeport service and `minikube service ...`

```
minikube start 

# Copy the docker images from your machine into the minikube instance.
minikube image load bff-service:1
minikube image load data-service:1
minikube image ls

cd basic-k8-istio-tutorial

kubectl apply -f data-service-config.yaml
kubectl apply -f data-service.yaml
kubectl apply -f bff-service-nodeport.yaml
minikube service bff-service --url

# then, using the host:port provided...

curl 127.0.0.1:57485
curl 127.0.0.1:57485/data

minikube stop
minikube delete
```

# ISTIO Edition

This version creates essentially the same things as the kubernetes service, but now includes ISTIO.

The main differences are:
* access to bff-service is now via istio-ingress-gateway
* there are two data-services, the original (data-service) and a new one (data-service-new). This illustrates using data-service-virtual to split traffic between the two data services based on a header.

```
minikube start --memory=16384 --cpus=4 --kubernetes-version=v1.26.1
istio install
kubectl label namespace default istio-injection=enabled

# since we completely destroyed minikube, once more...
minikube image load bff-service:1
minikube image load data-service:1
minikube image ls


# in another terminal, and get ready to provide your password...
minikube tunnel


kubectl apply -f istio-ingress-gateway.yaml
kubectl apply -f data-service-config.yaml
kubectl apply -f data-service.yaml
kubectl apply -f data-service-new.yaml
kubectl apply -f data-service-virtual.yaml
kubectl apply -f bff-service.yaml

curl http://127.0.01:80/data
curl http://127.0.01:80/data -H "bff-version: new"
```

# Resources

[Kubernetes crash course](https://www.youtube.com/watch?v=s_o8dwzRlu4)

* In just over 1 hour, this course covers the key concepts required to understand most of what is covered here.

[Extended Kubernetes not-so-crash course](https://www.youtube.com/watch?v=X48VuDVv0do)

* In just over 4 hours, this course fills in quite a bit more detail beyond the 1 hour course.

[ISTO Documentation](https://istio.io/latest/)

* Having given up in frustration at finding a very basic ISTIO intro tutorial that was for the current version and actually worked, I found the ISTIO documentation the best place to start.

[k9s](https://k9scli.io/)

* Purely optional, but I found k9s helpful in poking around what was going on in the kubernetes cluster. It's closely aligned to the kubectl cli, but I'd suggest not relying on it too much, be familiar with the kubectl cli.

