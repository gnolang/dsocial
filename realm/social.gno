package social

import (
	"gno.land/p/demo/avl"
)

var (
	gUserPostsByAddress avl.Tree // user's std.Address -> *UserPosts
	gUserAddressByName  avl.Tree // user's username -> std.Address
	postsCtr            uint64   // increments Post.id globally
)
