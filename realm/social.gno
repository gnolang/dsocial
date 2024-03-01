package social

import (
	"gno.land/p/demo/avl"
)

var (
	gUserPostsByAddress avl.Tree // user's std.Address -> *UserPosts
	postsCtr            uint64   // increments Post.id globally
)
