# app300
Easily creating an application in under 5 minutes (or 300 seconds). Uses Vagrant and the AWS SDK to create and deploy a fully functioning application that is well architected, easily maintainable, and adheres to the twelve factor application.

## Scenarios & Steps

### Creating a new application locally 
Looking to start a new application locally, fresh code and fresh start.
```
git clone https://github.com/haseebnqureshi/app300.git ./MyApp
cd MyApp
vagrant up
vagrant ssh (then vagrant as its password)
bash quickstart.sh
```

Will present number of questions and prompts. Answer them to quickly create the starting pieces to your App, API, spinning up your NoSQL database (using RethinkDB), creating and ensuring your AWS S3 bucket(s), and your remote Git repository url.

```
This tech stack is opinionated. Are you okay with the following? (y/N):
1. NoSQL Database (RethinkDB)
2. Node.js API (Express)
3. Node.js App (Express to serve, Pug to render templates, UIKit and Vue.js for UI components)
4. File Storage (AWS S3)
```

```
Now generating a master .env file for all your application environment variables, located at your application's root directory...
```

```
In order for all of this to continue, we need programmatic access onto your AWS account. Don't worry, we will not be altering or modifying any resources or data created outside of the app300 framework. You can also modify this anytime in your application's .env file:
```

```
1. AWS Access Key ID:
```

```
2. AWS Secret Access Key ID:
```

Note the only aspect to app300 not truly local is our use of AWS S3. This way, S3 integrations are written from the start in any application, allowing for your application to maintain its statelessness.

### Note on use of Git
The framework relies on developers committing their changes via git. This is how app300 orchestrates and manages deployments.

### Deploy application onto AWS
Gone through and created your app300 application, now deploying onto AWS.
```
cd MyApp
vagrant up
vagrant ssh (then vagrant as its password)
bash deploy.sh
```

Will present any previously deployed environments, and ability to deploy new environments:
```
1. "test" environment deployed
2. "live" environment deployed
3. deploy new environment...
4. Cancel
```

If previously deployed environment is selected, any new committed Git changes will be deployed there:
```
Your changes have now been deployed onto "test"!
```

Whenever deploying to previously created environments, deployed environments will also restart their keep-alive processes. This way when your API or App have been changed, committed, and deployed, your users will instantly see these changes. (Good reminder, this entire framework is opinionated.)

If "deploy new environemnt" is selected, the prompt will present four scenarios for deployment:
1. Consolidated onto 1 EC2 instance and 1 S3 bucket
2. Consolidated onto 1 EC2 instance and 1 S3 bucket (HTTPS)
3. Separated into 3 EC2 instances and 1 S3 bucket
4. Separated into 3 EC2 instances and 1 S3 bucket (HTTPS)
5. Cancel

### Manage deployed application environments
Need to clean up environments.
```
cd MyApp
vagrant up
vagrant ssh (then vagrant as its password)
bash environments.sh
```

Will present any previously deployed environments:
```
1. "test" environment deployed
2. "live" environment deployed
3. Cancel
```

When any environemnt is selected, you have then the option to remove the deployment:
```
Are you sure you want to remove this deployed environment? (y/N):
```

For safety and security reasons, removing any deployment will not remove any S3 buckets or their data. You'll have to manage that process yourself, ensuring you'll examine your data and make those informed decisions.

As with the database, the app300 framework will be taking a snapshot of the RethinkDB database and sending over to S3. This will occur synchronously before removing the database instance.















