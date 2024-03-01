package social

import (
	"std"
	"time"

	"gno.land/p/demo/avl"
	"gno.land/p/demo/ufmt"
	"gno.land/r/demo/users"
)

// Post a message to the caller's main user posts.
// The caller must already be registered with /r/demo/users Register.
// Return the "thread ID" of the new post.
// (This is similar to boards.CreateThread, but no message title)
func PostMessage(body string) PostID {
	std.AssertOriginCall()
	caller := std.GetOrigCaller()
	name := usernameOf(caller)
	if name == "" {
		panic("please register")
	}

	userPosts := getUserPosts(caller)
	if userPosts == nil {
		url := "/r/berty/social:" + name
		userPosts = newUserPosts(url, caller)
		gUserPostsByAddress.Set(caller.String(), userPosts)
	}

	thread := userPosts.AddThread(body)
	return thread.id
}

// Post a reply to the user posts of userPostsAddr where threadid is the ID returned by
// the original call to PostMessage. If postid == threadid then create another top-level
// post for the threadid, otherwise post a reply to the postid "sub reply".
// The caller must already be registered with /r/demo/users Register.
// Return the new post ID.
// (This is similar to boards.CreateReply.)
func PostReply(userPostsAddr std.Address, threadid, postid PostID, body string) PostID {
	std.AssertOriginCall()
	caller := std.GetOrigCaller()
	if usernameOf(caller) == "" {
		panic("please register")
	}
	userPosts := getUserPosts(userPostsAddr)
	if userPosts == nil {
		panic("posts for userPostsAddr do not exist")
	}
	thread := userPosts.GetThread(threadid)
	if thread == nil {
		panic("threadid in user posts does not exist")
	}
	if postid == threadid {
		reply := thread.AddReply(caller, body)
		return reply.id
	} else {
		post := thread.GetReply(postid)
		if post == nil {
			panic("postid does not exist")
		}
		reply := post.AddReply(caller, body)
		return reply.id
	}
}

// Repost the message from the user posts of userPostsAddr where threadid is the ID returned by
// the original call to PostMessage. This must be a top-level thread (not a reply).
// Return the new post ID.
// (This is similar to boards.CreateRepost.)
func RepostThread(userPostsAddr std.Address, threadid PostID, comment string) PostID {
	std.AssertOriginCall()
	caller := std.GetOrigCaller()
	name := usernameOf(caller)
	if name == "" {
		panic("please register")
	}
	dstUserPosts := getUserPosts(caller)
	if dstUserPosts == nil {
		url := "/r/berty/social:" + name
		dstUserPosts = newUserPosts(url, caller)
		gUserPostsByAddress.Set(caller.String(), dstUserPosts)
	}

	if userPostsAddr == caller {
		panic("Cannot repost a user's own message")
	}
	userPosts := getUserPosts(userPostsAddr)
	if userPosts == nil {
		panic("posts for userPostsAddr do not exist")
	}
	thread := userPosts.GetThread(threadid)
	if thread == nil {
		panic("threadid in user posts does not exist")
	}
	repost := thread.AddRepostTo(caller, comment, dstUserPosts)
	return repost.id
}

// Get all users with their address. The response is an avl.Tree where the key is the
// (sorted) user name and the value is the address.
func GetUsers() *avl.Tree {
	allUsers := avl.Tree{}
	gUserPostsByAddress.Iterate("", "", func(addr string, userPostsI interface{}) bool {
		if user := users.GetUserByAddress(std.Address(addr)); user != nil {
			// allUsers will be sorted by the name key.
			allUsers.Set(user.Name, addr)
		}
		return false
	})

	return &allUsers
}

// Get all users with their address (using GetUsers), sorted by name. The response is a JSON string.
func GetJsonUsers() string {
	allUsers := GetUsers()
	usersJson := ""
	allUsers.Iterate("", "", func(name string, addr interface{}) bool {
		if usersJson != "" {
			usersJson += ",\n  "
		}
		usersJson += ufmt.Sprintf("{\"name\": \"%s\", \"address\": \"%s\"}", name, addr.(string))
		return false
	})

	return ufmt.Sprintf("{\"n_users\": %d, \"users\": [\n  %s]}", allUsers.Size(), usersJson)
}

// Get posts in a thread for a user. A thread is the sequence of posts without replies.
// While each post has an an arbitrary id, it also has an index within the thread starting from 0.
// Limit the response to posts from startIndex up to (not including) endIndex within the thread.
// If you just want the total count, set startIndex and endIndex to 0 and see the response "n_threads".
// If threadID is 0 then return the user's top-level posts. (Like render args "user".)
// If threadID is X and replyID is 0, then return the posts (without replies) in that thread. (Like render args "user/2".)
// If threadID is X and replyID is Y, then return the posts in the thread starting with replyID. (Like render args "user/2/5".)
// The response includes reposts by this user (only if threadID is 0), but not messages of other
// users that are being followed. (See GetHomePosts.) The response is a JSON string.
func GetThreadPosts(userPostsAddr std.Address, threadID int, replyID int, startIndex int, endIndex int) string {
	userPosts := getUserPosts(userPostsAddr)
	if userPosts == nil {
		panic("posts for userPostsAddr do not exist")
	}

	if threadID == 0 {
		return getPosts(userPosts.threads, startIndex, endIndex)
	}

	thread := userPosts.GetThread(PostID(threadID))
	if thread == nil {
		panic(ufmt.Sprintf("thread does not exist with id %d", threadID))
	}

	if replyID == 0 {
		return getPosts(thread.replies, startIndex, endIndex)
	} else {
		reply := thread.GetReply(PostID(replyID))
		if reply == nil {
			panic(ufmt.Sprintf("reply does not exist with id %d in thread with id %d", replyID, threadID))
		}

		return getPosts(reply.replies, startIndex, endIndex)
	}
}

// Get home posts for a user, which are the user's top-level posts plus all posts of all
// users being followed.
// The response is a map of postID -> *Post. The avl.Tree sorts by the post ID which is
// unique for every post and increases in time.
func GetHomePosts(userPostsAddr std.Address) *avl.Tree {
	userPosts := getUserPosts(userPostsAddr)
	if userPosts == nil {
		panic("posts for userPostsAddr do not exist")
	}

	// TODO: This computes all home posts on each call. Can this be more efficient?
	allPosts := avl.Tree{} // postID -> *Post
	userPosts.threads.Iterate("", "", func(id string, postI interface{}) bool {
		post := postI.(*Post)
		allPosts.Set(id, post)
		return false
	})
	userPosts.addFollowedPosts(&allPosts, time.Time{}, debugNow())

	return &allPosts
}

// Get home posts for a user (using GetHomePosts), which are the user's top-level posts plus all
// posts of all users being followed.
// Limit the response to posts from startIndex up to (not including) endIndex within the home posts.
// If you just want the total count, set startIndex and endIndex to 0 and see the response "n_posts".
// The response is a JSON string.
func GetJsonHomePosts(userPostsAddr std.Address, startIndex int, endIndex int) string {
	allPosts := GetHomePosts(userPostsAddr)
	postsJson := ""
	for i := startIndex; i < endIndex && i < allPosts.Size(); i++ {
		_, postI := allPosts.GetByIndex(i)
		if postsJson != "" {
			postsJson += ",\n  "
		}

		postJson, err := postI.(*Post).MarshalJSON()
		if err != nil {
			panic("can't get post JSON")
		}
		postsJson += ufmt.Sprintf("{\"index\": %d, \"post\": %s}", i, string(postJson))
	}

	return ufmt.Sprintf("{\"n_posts\": %d, \"posts\": [\n  %s]}", allPosts.Size(), postsJson)
}

// Update the caller to follow the user with followedAddr. See UserPosts.Follow.
func Follow(followedAddr std.Address) {
	std.AssertOriginCall()
	caller := std.GetOrigCaller()
	name := usernameOf(caller)
	if name == "" {
		panic("please register")
	}

	if followedAddr == caller {
		panic("you can't follow yourself")
	}

	userPosts := getUserPosts(caller)
	if userPosts == nil {
		// A user can follow someone before doing any posts, so create the UserPosts.
		url := "/r/berty/social:" + name
		userPosts = newUserPosts(url, caller)
		gUserPostsByAddress.Set(caller.String(), userPosts)
	}

	userPosts.Follow(followedAddr)
}

// Update the caller to unfollow the user with followedAddr. See UserPosts.Unfollow.
func Unfollow(followedAddr std.Address) {
	std.AssertOriginCall()
	caller := std.GetOrigCaller()
	name := usernameOf(caller)
	if name == "" {
		panic("please register")
	}

	userPosts := getUserPosts(caller)
	if userPosts == nil {
		// We don't expect this, but just do nothing.
		return
	}

	userPosts.Unfollow(followedAddr)
}
