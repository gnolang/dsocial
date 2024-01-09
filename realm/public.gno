package gnosocial

import (
	"std"
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

	thread := userPosts.AddThread(caller, body)
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
