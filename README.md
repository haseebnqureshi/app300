# app300
![github license](https://img.shields.io/github/license/haseebnqureshi/app300.svg)
![npm downloads](https://img.shields.io/npm/dt/app300.svg)

Easily creating an application in under 5 minutes (or 300 seconds). Uses Vagrant and the AWS SDK to create and deploy a fully functioning application that is well architected, easily maintainable, and adheres to the twelve factor application.

### Getting Started
Quick note: this project uses Vagrant to create an environment that closely matches an EC2 instance. The Vagrantfile defaults to an EC2 Nano, but you can easily switch between sizes in the Vagrantfile. 

```
npm install app300 -g
mkdir MyProject
cd MyProject
app300
(finish the prompts, say Yes to all if you're starting out)
vagrant up
```

Viola! Navigate to http://192.168.33.10:3000 for your API, http://192.168.33.10:8080 for your App, and http://192.168.33.10:9090 for your RethinkDB administration page.

### README is not completely fleshed out
There's *a lot* that's not here in this README yet. So until it's all fleshed out and if you've got any questions, hit me up on github. Thanks - HQ

### Deploying onto AWS
Quick and dirty step by step on deploying onto your own EC2 instance in AWS.

1. Sign into AWS console and navigate to your EC2 instances. Launch a new EC2 instance.
2. Select Ubuntu Server 16.04 LTS (HVM), SSD Volume Type, 64-bit (ami-759bc50a). Select your desired size and capacity of instance. Select "Review and Launch", then "Edit security groups". If you're launching a non-SSL project (typically non production and testing in AWS, add ports 80, 3000, and 9090, in addition to the port 22). If you're launching a SSL project into production, just add port 443. (And hey, if you're a pro, do whatever you need to do here.)
3. Press "Launch" and confirm your EC2's key pair. Then press "Launch Instances".
4. Once you're EC2 instance is finished and shows as "running", follow the "Connect" instructions and SSH into your newly created EC2 instance.
5. Your EC2 instance should already come with git installed, so go ahead and clone your project. ```cd``` into your project directory.
6. ```sudo su``` and then copy and paste the following commands to install your project and its framework dependencies:
```
cd _framework
  bash ubuntu.sh
  npm install 
cd ..
```
```
cd database/_framework
  bash install.sh
cd ../..
```
```
cd api/_framework
  bash install.sh
cd ../..
```
```
cd app/_framework
  bash install.sh
cd ../..
```
6. As of right now, your database, api, and app are all now running! But we don't have our ```.env``` variables plugged in yet (because you shouldn't be committing them), and we haven't hardened our database yet. Let's harden our database first.
7. As ```sudo su``` and in the root of your project, run ```bash database/_framework/production.sh```. This locks down the admin interface and limits connections to only those to ```localhost```. Now if you're running your project between multiple EC2 instances, you'll want to modify your RethinkDB configuration manually, to allow the appropriate IP addresses for connection making.
8. Populate the ```.env``` variables in your database, api, app (and your project's ```_framework``` directory if you're running both api and app on port 443). Then ```sudo su``` and ```pm2 restart all``` for your environment variables to take effect.
9. Now you're done! We'll streamline this process, but this will have to do for now.

