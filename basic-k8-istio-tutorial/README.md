Getting started sequence:

Pre-requisite:
Start docker with more resources than specified for minikube start.
Download istio.
Get istioctl and kubectl on the path.
May want to:
```
brew install kubectl
```



```
minikube start --memory=16384 --cpus=4 --kubernetes-version=v1.26.1
istioctl install
```

Build the docker containers and upload them into the kubernetes cluster:
```
docker build... the usual way then:
minikube image load bff-service
minikube image load data-service
minikube image ls
```

```
kubectl label namespace default istio-injection=enabled

kubectl apply -f samples/addons

kubectl apply -f data-service-config.yaml
kubectl apply -f data-service.yaml
kubectl apply -f bff-service.yaml
```

To get access to it on mac:
[Loadbalancer access](https://minikube.sigs.k8s.io/docs/handbook/accessing/#loadbalancer-access)
```
minikube tunnel
kubectl get svc -n istio-system
```

Use the external-ip of the istio-ingressgateway

e.g.
```
curl 127.0.0.1:80/
curl 127.0.0.1:80/data
```

To do a complete reset:
```
minikube stop
minikube delete
```
