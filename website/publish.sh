#! /bin/zsh
GIT_USER=rollmind \
  CURRENT_BRANCH=main \
  USE_SSH=true \
npm run publish-gh-pages
