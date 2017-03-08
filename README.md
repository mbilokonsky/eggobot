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