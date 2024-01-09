package gnosocial

import (
	"gno.land/p/demo/avl"
)

var (
	gUserPostsByAddress avl.Tree // user's std.Address -> *UserPosts
)
