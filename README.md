# Summary of Changes
Here's a summary of the work done so far by Data Obscura.
  - complete refactor of codebase. index.js now sets stuff up, but egghead api integration is in the `api/` folder, bot behavior is in the `behavior/` folder and there's some general stuff in `utils/`.
  - We've pulled out HAPI for now at least, since botkit ships with its own server for webhooks and slash commands. 
  - Features are added as new folders in the `behavior/` folder. Each feature should have an `index.js` which exports a function which takes a controller. 
  - Greeting logic extracted from index.js and placed into `behavior/greeting`
  - Fedex integration implemented in `behavior/fedex`
  - Email Confirmation integration is in `behavior/email_confirmation`

There are still some unresolved TODOs here, notably around interfacing with egghead API and around workflow design in the email_confirmation branch. I estimate another two hours of work once questions have been answered will be sufficient to close out this sprint.

This is a bot built to assist egghead admins with new instructors.

## User Joins

When a user joins slack, we need to associate their Slack id with the instructor account. Generally this means a simple lookup via email address, but sometimes the email doesn't match. In this case, we want to make a "best guess" and ask the user for confirmation in a DM.

"Is this you? yes/no"

If yes, just associate, if no, then we want to ask them for additional information so we can slueth it out.

We'd also like to send them a greeting of some sort with some intelligent "next steps".

## Publication Lifecycle

Notifications and calls to action at various steps in publication cycle. This might include weekday reminders of outstanding review tasks or periodic reminders for instructors that they have some task left to get content published.

We can also add lesson reviewing directly in slack, where we can ask for alist of lessons that need to be reviewed and add comments/feedback directly in Slack.

## List Requested Lessons

We'd like to be able to respond to a command and list out available lessons that instructors can claim in Slack.

# Technical stuff

Create a `.env` file in the root of the project (see `.env.template`). Add a key for the bot you want to connect to. Redis url should be fine with the default provided.

```
yarn install
yarn start
```

eggobot uses the custom Redis storage, so you'll want that installed locally. 

Install Redis with homebrew:
```
brew install redis
```

Launch redis when machine starts:
```
ln -sfv /usr/local/opt/redis/*.plist ~/Library/LaunchAgents
```

Start Redis now:
```
launchctl load ~/Library/LaunchAgents/homebrew.mxcl.redis.plist
```

