#! /bin/zsh
GIT_USER=rollmind \
  CURRENT_BRANCH=main \
  USE_SSH=true \
  yarn run publish-gh-pages # 또는 `npm run publish-gh-pages`
