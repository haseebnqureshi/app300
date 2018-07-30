# app300
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
