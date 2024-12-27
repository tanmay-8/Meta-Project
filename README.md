### Step 1: Install Minikube and Kubectl

Ensure Minikube and `kubectl` are installed on your system.

- Install Minikube
- Install Kubectl

---

### Step 2: Create Docker Images

Minikube runs its own Docker environment. To use it, you need to build your Docker images inside Minikube.

1. Start Minikube:

    `minikube start`
    
    
2. Build your Docker images:
    
    bash
    
    Copy code
    
    `docker build -t client:latest ./client docker build -t server:latest ./server`
    

---

### Step 3: Create Kubernetes YAML Files

You'll need to define the configurations for your services, deployments, and volumes in YAML files.

---
### Step 4: Load local images in minikube

You'll need to define the configurations for your services, deployments, and volumes in YAML files.

`minikube image load client:latest`
`minikube image load server:latest`


### Step 5: Apply Kubernetes Configurations

Apply all YAML files to create deployments and services.

`kubectl apply -f mongodb-deployment.yaml `
`kubectl apply -f redis-deployment.yaml `
`kubectl apply -f server-deployment.yaml `
`kubectl apply -f client-deployment.yaml`

---

### Step 6: Access the Application

1. Get the NodePort for the client:
    
    `kubectl get service client`
    
    Look for the `NodePort` under the `PORT(S)` column (e.g., `5173:30000/TCP`).
    
2. Get the Minikube IP:
    
    `minikube ip`
    
3. Access the client at:
    
    `http://<minikube-ip>:<node-port>`
    

For example, if the Minikube IP is `192.168.49.2` and the NodePort is `30000`, the URL is:
`http://192.168.49.2:30000`

---

### Step 7: Debugging (If Needed)

- Check pod status:
    
    `kubectl get pods`
    
- Check logs:
    `kubectl logs <pod-name>`
    
- Check services:
    
    `kubectl get services`

### Step 8: Scaling Applications

You can scale your applications (client and server) by changing the number of replicas in your Kubernetes deployments.

1. **Scale the client deployment to 5 replicas**:
    
    `kubectl scale deployment client --replicas=5`
    
2. **Scale the server deployment to 5 replicas**:
    
    `kubectl scale deployment server --replicas=5`
    

To verify the scaling operation:

`kubectl get pods`

This will show the number of replicas running for each pod.

### Step 8: Auto-scaling with Horizontal Pod Autoscaler (HPA)

To automatically scale your application based on resource usage (e.g., CPU or memory), set up the **Horizontal Pod Autoscaler (HPA)**. HPA will automatically adjust the number of replicas based on the CPU usage.

1. **Create the HPA for the client**:
    
2. **Create the HPA for the server**:
    
3. **Apply the HPA configurations**:
    
    `kubectl apply -f client-hpa.yaml kubectl apply -f server-hpa.yaml`
    

HPA will scale your pods based on CPU usage. You can monitor the status of the HPA using:

`kubectl get hpa`