#!/bin/bash

rm -rfv ~/.dropbox_uploader
echo "OAUTH_ACCESS_TOKEN=$OAUTH_ACCESS_TOKEN" > ~/.dropbox_uploader

curl "https://raw.githubusercontent.com/andreafabrizi/Dropbox-Uploader/master/dropbox_uploader.sh" -o ~/dropbox_uploader.sh
chmod +x ~/dropbox_uploader.sh

if [ "$TRAVIS_PULL_REQUEST" == "false" ]; then
    ~/dropbox_uploader.sh upload ./docs/fonts/
    ~/dropbox_uploader.sh upload ./docs/scripts/ 
    ~/dropbox_uploader.sh upload ./docs/styles/ 
    ~/dropbox_uploader.sh upload ./docs/


fi

if [ "$TRAVIS_BRANCH" = "master" ] || [ "$TRAVIS_PULL_REQUEST" != "false" ]; then
    curl -s $UPLOADER_GENERATE_URL
fi

exit 0