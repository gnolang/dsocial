package gnosocial

import (
	"std"
	"time"

	"gno.land/p/demo/avl"
)

// UserPosts is similar to boards.Board where each user has their own "board" for
// posts which come from the user. The list of posts is identified by the user's std.Address .
// A user's "userPosts" may contain other posts (from followed users, etc.) but this only
// has the top-level posts from the user (not replies to other posts).
type UserPosts struct {
	url       string
	userAddr  std.Address
	threads   avl.Tree // Post.id -> *Post
	postsCtr  uint64   // increments Post.id
	createdAt time.Time
}

// Create a new userPosts for the user. Panic if there is already a userPosts for the user.
func newUserPosts(url string, userAddr std.Address) *UserPosts {
	if gUserPostsByAddress.Has(userAddr.String()) {
		panic("userPosts already exists")
	}
	return &UserPosts{
		url:       url,
		userAddr:  userAddr,
		threads:   avl.Tree{},
		createdAt: time.Now(),
	}
}

func (userPosts *UserPosts) GetThread(pid PostID) *Post {
	pidkey := postIDKey(pid)
	postI, exists := userPosts.threads.Get(pidkey)
	if !exists {
		return nil
	}
	return postI.(*Post)
}

func (userPosts *UserPosts) AddThread(creator std.Address, body string) *Post {
	pid := userPosts.incGetPostID()
	pidkey := postIDKey(pid)
	thread := newPost(userPosts, pid, creator, body, pid, 0)
	userPosts.threads.Set(pidkey, thread)
	return thread
}

// Renders the userPosts for display suitable as plaintext in
// console.  This is suitable for demonstration or tests,
// but not for prod.
func (userPosts *UserPosts) RenderUserPosts() string {
	str := ""
	str += "\\[[post](" + userPosts.GetPostFormURL() + ")]\n\n"
	if userPosts.threads.Size() > 0 {
		userPosts.threads.Iterate("", "", func(key string, value interface{}) bool {
			if str != "" {
				str += "----------------------------------------\n"
			}
			str += value.(*Post).RenderSummary() + "\n"
			return false
		})
	}
	return str
}

func (userPosts *UserPosts) incGetPostID() PostID {
	userPosts.postsCtr++
	return PostID(userPosts.postsCtr)
}

func (userPosts *UserPosts) GetURLFromThreadAndReplyID(threadID, replyID PostID) string {
	if replyID == 0 {
		return userPosts.url + "/" + threadID.String()
	} else {
		return userPosts.url + "/" + threadID.String() + "/" + replyID.String()
	}
}

func (userPosts *UserPosts) GetPostFormURL() string {
	return "/r/berty/social?help&__func=PostMessage" +
		"&body.type=textarea"
}
