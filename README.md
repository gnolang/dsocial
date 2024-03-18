# gnosocial
Experimental: Social apps and dApps on Gno.land

# Test from command line

To install gnokey in the gno repo in gno/gno.land enter:

    make install

To install gnodev, in the gno repo in gno/contribs enter:

    make install.gnodev

To start gnodev, in this repo in gnosocial/realm enter:

    gnodev .

To install the faucet, in another terminal enter:

    git clone https://github.com/gnolang/faucet
    cd faucet
    make build

To start the faucet using the mnemonic of the test1 key, enter:

    ./build/faucet serve -send-amount 10000000000ugnot -chain-id dev -remote http://localhost:36657 -mnemonic "source bonus chronic canvas draft south burst lottery vacant surface solve popular case indicate oppose farm nothing bullet exhibit title speed wink action roast"

To send coins to your user account, in another terminal enter the following (with your account number):

    curl --location --request POST 'http://localhost:8545' --header 'Content-Type: application/json' --data '{"To": "g1juz2yxmdsa6audkp6ep9vfv80c8p5u76e03vvh"}'

To register the user, enter the following (change jefft0 to your account username):

    gnokey maketx call -pkgpath "gno.land/r/demo/users" -func "Register" -args "" -args "jefft0" -args "Profile description" -gas-fee "10000000ugnot" -gas-wanted "2000000" -send "200000000ugnot" -broadcast -chainid dev -remote 127.0.0.1:36657 jefft0

To post a message, enter the following (change jefft0 to your account username):

    gnokey maketx call -pkgpath "gno.land/r/berty/social" -func "PostMessage" -args "My first post" -gas-fee "1000000ugnot" -gas-wanted "5000000" -broadcast -chainid dev -remote 127.0.0.1:36657 jefft0

Note that this returns the "thread ID" of the new post like "(1 gno.land/r/berty/social.PostID)".

To view the result in a browser, go to the following URL (change jefft0 to your account username):

    http://127.0.0.1:8888/r/berty/social:jefft0

To post a reply, enter the following where THREADID and POSTID are both the thread ID from PostMessage
(change the account number and jefft0 to your account):

    gnokey maketx call -pkgpath "gno.land/r/berty/social" -func "PostReply" -args "g1juz2yxmdsa6audkp6ep9vfv80c8p5u76e03vvh" -args THREADID -args POSTID -args "my reply" -gas-fee "1000000ugnot" -gas-wanted "5000000" -broadcast -chainid dev -remote 127.0.0.1:36657 jefft0
