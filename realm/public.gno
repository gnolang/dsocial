package social

import (
	"std"
	"strconv"

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

	userPosts := getOrCreateUserPosts(caller, name)
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
	if userPostsAddr == caller {
		panic("Cannot repost a user's own message")
	}

	name := usernameOf(caller)
	if name == "" {
		panic("please register")
	}
	dstUserPosts := getOrCreateUserPosts(caller, name)

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

// Update the home posts by scanning all posts from all followed users and adding the
// followed posts since the last call to RefreshHomePosts (or since started following the user).
// Return the new count of home posts. The result is something like "(12 int)".
func RefreshHomePosts(userPostsAddr std.Address) int {
	userPosts := getUserPosts(userPostsAddr)
	if userPosts == nil {
		panic("posts for userPostsAddr do not exist")
	}
	userPosts.refreshHomePosts()

	return userPosts.homePosts.Size()
}

// Get the number of posts which GetHomePosts or GetJsonHomePosts will return.
// The result is something like "(12 int)".
// This returns the current count of the home posts (without need to pay gas). To include the
// latest followed posts, call RefreshHomePosts.
func GetHomePostsCount(userPostsAddr std.Address) int {
	return GetHomePosts(userPostsAddr).Size()
}

// Get home posts for a user, which are the user's top-level posts plus all posts of all
// users being followed.
// The response is a map of postID -> *Post. The avl.Tree sorts by the post ID which is
// unique for every post and increases in time.
// If you just want the total count, use GetHomePostsCount.
// This returns the current state of the home posts (without need to pay gas). To include the
// latest followed posts, call RefreshHomePosts.
func GetHomePosts(userPostsAddr std.Address) *avl.Tree {
	userPosts := getUserPosts(userPostsAddr)
	if userPosts == nil {
		panic("posts for userPostsAddr do not exist")
	}
	return &userPosts.homePosts
}

// Get home posts for a user (using GetHomePosts), which are the user's top-level posts plus all
// posts of all users being followed.
// Limit the response to posts from startIndex up to (not including) endIndex within the home posts.
// If you just want the total count, use GetHomePostsCount.
// The response is a JSON string.
// This returns the current state of the home posts (without need to pay gas). To include the
// latest posts, call RefreshHomePosts.
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

	// A user can follow someone before doing any posts, so create the UserPosts if needed.
	userPosts := getOrCreateUserPosts(caller, name)
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

// Call users.GetUserByAddress and return the result as JSON, or "" if not found.
// (This is a temporary utility until gno.land supports returning structured data directly.)
func GetJsonUserByAddress(addr std.Address) string {
	user := users.GetUserByAddress(addr)
	if user == nil {
		return ""
	}

	return marshalJsonUser(user)
}

// Call users.GetUserByName and return the result as JSON, or "" if not found.
// (This is a temporary utility until gno.land supports returning structured data directly.)
func GetJsonUserByName(name string) string {
	user := users.GetUserByName(name)
	if user == nil {
		return ""
	}

	return marshalJsonUser(user)
}

// Get the UserPosts info for the user with the given address, including
// url, n_threads, n_followers and n_following. If the user address is not
// found, return "". The name of this function has "Info" because it just returns
// the number of items, not the items themselves. To get the items, see
// GetJsonFollowers, etc.
// The response is a JSON string.
func GetJsonUserPostsInfo(address std.Address) string {
	userPosts := getUserPosts(address)
	if userPosts == nil {
		return ""
	}

	json, err := userPosts.MarshalJSON()
	if err != nil {
		panic("can't get UserPosts JSON")
	}

	return string(json)
}

// Get the UserPosts for the user with the given address, and return
// the list of followers. If the user address is not found, return "".
// The response is a JSON string.
func GetJsonFollowers(address std.Address) string {
	userPosts := getUserPosts(address)
	if userPosts == nil {
		return ""
	}

	json := "[\n  "
	userPosts.followers.Iterate("", "", func(addr string, value interface{}) bool {
		if len(json) > 4 {
			json += ",\n  "
		}
		json += ufmt.Sprintf(`{"address": "%s"}`, addr)
		return false
	})
	json += "]"

	return json
}

// Get the UserPosts for the user with the given address, and return
// the list of other users that this user is following.
// If the user address is not found, return "".
// The response is a JSON string.
func GetJsonFollowing(address std.Address) string {
	userPosts := getUserPosts(address)
	if userPosts == nil {
		return ""
	}

	json := "[\n  "
	userPosts.following.Iterate("", "", func(addr string, infoI interface{}) bool {
		if len(json) > 4 {
			json += ",\n  "
		}
		startedAt, err := infoI.(*FollowingInfo).startedFollowingAt.MarshalJSON()
		if err != nil {
			panic("can't get startedFollowingAt JSON")
		}
		json += ufmt.Sprintf(`{"address": "%s", "started_following_at": %s}`,
			addr, string(startedAt))
		return false
	})
	json += "]"

	return json
}

// TODO: This is a temporary copy. Remove this when they merge https://github.com/gnolang/gno/pull/1708.
func listKeysByPrefix(tree avl.Tree, prefix string, maxResults int) []string {
	end := ""
	n := len(prefix)
	// To make the end of the search, increment the final character ASCII by one.
	for n > 0 {
		if ascii := int(prefix[n-1]); ascii < 0xff {
			end = prefix[0:n-1] + string(ascii+1)
			break
		}

		// The last character is 0xff. Try the previous character.
		n--
	}

	result := []string{}
	tree.Iterate(prefix, end, func(key string, value interface{}) bool {
		result = append(result, key)
		if len(result) >= maxResults {
			return true
		}
		return false
	})
	return result
}

// Get a list of user names starting from the given prefix. Limit the
// number of results to maxResults.
func ListUsersByPrefix(prefix string, maxResults int) []string {
	return listKeysByPrefix(gUserAddressByName, prefix, maxResults)
}

// Get a list of user names starting from the given prefix. Limit the
// number of results to maxResults.
// The response is a JSON string.
func ListJsonUsersByPrefix(prefix string, maxResults int) string {
	names := ListUsersByPrefix(prefix, maxResults)

	json := "["
	for i, name := range names {
		if i > 0 {
			json += ", "
		}
		json += strconv.Quote(name)
	}
	json += "]"
	return json
}
