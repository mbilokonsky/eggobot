This is a bot built to assist egghead admins with new instructors.

## User Joins
When a user joins a channel that this bot is in, the bot will check to see if it has a 'slug' on file for that user. This is the egghead api slug - like the last part of `api/instructors/mykola-bilokonsky`.

If the slug is present, it knows this whole thing has already been run and everything's fine.

But if there is no slug, it tries to find the correct instructor via the egghead API. 

  * First, it compares the slack email address to the egghead API - if the instructor used the same email address in both places (this is probably 90% of cases) then it has its match and we have our instructor object.

  * If a matching email address can't be found, it falls back to checking the various slack name fields. Now, this is a fuzzy match on the egghead side, so getting a name result back isn't a guaranteed match. Rather than asking the user to confirm (and thus opening us up to user error or even malicious intent), if a name match is found then we send a message to the admin channel (set in `process.env.ADMIN_CHANNEL`). This message just asks "Hey, can someone confirm that @user is instructor-slug?" and has two buttons. Anyone in that channel can hit either yes or no. If they hit yes, we get our instructor object.

  * If we end up with an instructor object, then we save the slack user with the slug as a property, and we also hit the egghead endpoint to add the slack_id to the instructor object. We then post a happy notice to the admin channel letting everyone know a new instructor has been added.

  * If we end up with no instructor object, we notify the admin channel. We also point out that there's a slash command to manually attach a user to an instructor account - `/slug @mykola mykola-bilokonsky` would be an example. 

## Fedex Tracking Number
If you want to associate a fedex tracking number with a slack user, just type `/fedex @username tracking_number` and it should Just Work. Note: the user must have a slug property attached, so the onboarding process must have been completed. Without a slug there's no way to get the URL to update the user. 

## Middleware
We've added some middleware that pre-processes slash commands. When a slash command comes in, the following happens:
  * we tokenize the text (splitting on spaces)
  * we group any tokens that had been wrapped in double-quotes (so you can have a multi-word token)
  * we find any references to users or channels, and we resolve them - they become available as `token.user` or `token.channel`
  * we then pass the command up the chain, where it's routed to the correct slash command handler via some logic in `lib/behavior/index.js`

Note: if a @user or #channel reference is made, but that user or channel doesn't exist, the slack command will fail and the user will be notified as to why. Also, if there is a user or channel object nested in a double-quoted string we don't do anything with it (unless it happens to be the first word in the string, I guess).

See `lib/behavior/slash_commands` to see how our two commands, `/slug` and `/fedex`, are wired up. This middleware approach takes care of most of the boilerplate code, allowing us to focus on behavior.

# Technical stuff

In order to use slash commands and interactive messages, this app has grown in complexity. It's no longer a slack 'custom integration', instead it's a full 'slack app'. This means you have to go into the slack API for your team and create an app to get the full credentials. It also means that you're limited in terms of what you can do with local development - slack apps must live on a publicly accessible server. I've been using heroku to deploy and test most of this. There is a mock server here, but given the heroku constraints I've not been using it - I've just been letting my real API server requests fail with permission errors, so the final parts of these operations will still have to be tested.

Create a `.env` file in the root of the project (see `.env.template`). Note that ADMIN_CHANNEL is the id, not the name, of the admin channel you want to use.

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

