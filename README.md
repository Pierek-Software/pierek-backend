# Pierek Backend Server

1. copy env.dist to .env with correct variables
2. npm i
3. npm run build
4. npm run start

# FAQ

## Why no test ? (Mocha, Jest)

Because the list of features change frequently, it's not enterprise. But you are right, some test are needed :)

## What is the general architecture ?

pierek.com => Point to EC2 Instance => DOCKER CONTAINER (BACKEND) => NGINX Reverse Proxy + https

api.pierek.com => Point to EC2 Instance => DOCKER CONTAINER (FRONTEND) => NGINX Reverse Proxy + https

cdn.pierek.com => Point to Amazon CloudFront (CDN) => Point to S3 Bucket (Read only via CloudFront)

Frontend (Next.js) communicate with Backend (Node.js) via REST (it's not perfect REST but solve problems i have)

Route 53 for DNS configuration
Amazon Secret Manager for storing secrets
Ubuntu as OS
NGINX as reverse proxy
Let's Encrypt as https

## There is no Kubernetes, Blue / Green, Rolling and Canary

You are right. If I have time will add :)

## You can move it to yarn workspaces and create single pierek.com project

You are also right, will do it :)
