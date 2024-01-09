# gnosocial
Experimental: Social apps and dApps on Gno.land

# Test from command line

To install gnokey, gnofaucet etc., in the gno repo in gno/gno.land enter:

    make install

To install gnodev, in the gno repo in gno/contribs enter:

    make install.gnodev

To start gnodev, in this repo in gnosocial/realm enter:

    gnodev .

To use gnofaucet, follow instructions at https://github.com/gnolang/gno/blob/master/gno.land/cmd/gnofaucet/README.md
to locally set up the test1 account. To start the faucet, enter the following for example (with your home directory):

    gnofaucet serve -send 10000000000ugnot -chain-id tendermint_test -remote localhost:36657 test1 -home "/Users/jefft0/Library/Application Support/gno"

To send coins to your user account, in another terminal enter the following (with your account number):

    curl --location --request POST 'http://localhost:5050' --header 'Content-Type: application/x-www-form-urlencoded' --data-urlencode 'toaddr=g1juz2yxmdsa6audkp6ep9vfv80c8p5u76e03vvh'

To register the user, enter the following (change jefft0 to your account username):

    gnokey maketx call -pkgpath "gno.land/r/demo/users" -func "Register" -args "" -args "jefft0" -args "Profile description" -gas-fee "10000000ugnot" -gas-wanted "2000000" -send "200000000ugnot" -broadcast -chainid tendermint_test -remote 127.0.0.1:36657 jefft0

To post a message, enter the following (change jefft0 to your account username):

    gnokey maketx call -pkgpath "gno.land/r/berty/social" -func "PostMessage" -args "My first post" -gas-fee "1000000ugnot" -gas-wanted "5000000" -broadcast -chainid tendermint_test -remote 127.0.0.1:36657 jefft0

Note that this returns the "thread ID" of the new post like "(1 gno.land/r/berty/social.PostID)".

To view the result in a browser, go to the following URL (change jefft0 to your account username):

    http://127.0.0.1:8888/r/berty/social:jefft0

To post a reply, enter the following where THREADID and POSTID are both the thread ID from PostMessage
(change the account number and jefft0 to your account):

    gnokey maketx call -pkgpath "gno.land/r/berty/social" -func "PostReply" -args "g1juz2yxmdsa6audkp6ep9vfv80c8p5u76e03vvh" -args THREADID -args POSTID -args "my reply" -gas-fee "1000000ugnot" -gas-wanted "5000000" -broadcast -chainid tendermint_test -remote 127.0.0.1:36657 jefft0
