package social

import (
	"bytes"
	"sort"
	"std"
	"strconv"
	"strings"
	"time"

	"gno.land/p/demo/avl"
	"gno.land/p/demo/ufmt"
	"gno.land/r/demo/users"
)

type FollowingInfo struct {
	startedFollowingAt time.Time
	startedPostsCtr    PostID
}

// UserPosts is similar to boards.Board where each user has their own "board" for
// posts which come from the user. The list of posts is identified by the user's std.Address .
// A user's "home feed" may contain other posts (from followed users, etc.) but this only
// has the top-level posts from the user (not replies to other user's posts).
type UserPosts struct {
	url           string
	userAddr      std.Address
	threads       avl.Tree // PostID -> *Post
	homePosts     avl.Tree // PostID -> *Post. Includes this user's threads posts plus posts of users being followed.
	lastRefreshId PostID   // Updated by refreshHomePosts
	followers     avl.Tree // std.Address -> ""
	following     avl.Tree // std.Address -> *FollowingInfo
}

// Create a new userPosts for the user. Panic if there is already a userPosts for the user.
func newUserPosts(url string, userAddr std.Address) *UserPosts {
	if gUserPostsByAddress.Has(userAddr.String()) {
		panic("userPosts already exists")
	}
	return &UserPosts{
		url:           url,
		userAddr:      userAddr,
		threads:       avl.Tree{},
		homePosts:     avl.Tree{},
		lastRefreshId: PostID(postsCtr), // Ignore past messages of followed users.
		followers:     avl.Tree{},
		following:     avl.Tree{},
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

// Add a new top-level thread to the userPosts. Return the new Post.
func (userPosts *UserPosts) AddThread(body string) *Post {
	pid := userPosts.incGetPostID()
	pidkey := postIDKey(pid)
	thread := newPost(userPosts, pid, userPosts.userAddr, body, pid, 0, "")
	userPosts.threads.Set(pidkey, thread)
	// Also add to the home posts.
	userPosts.homePosts.Set(pidkey, thread)
	return thread
}

// If there is a UserPosts for followedAddr, then add it to following,
// and add this user to its followers.
// If there is no UserPosts for followedAddr, then do nothing. (We don't expect
// this because this is usually called by clicking on the display page of followedAddr.)
func (userPosts *UserPosts) Follow(followedAddr std.Address) {
	followedUserPosts := getUserPosts(followedAddr)
	if followedUserPosts != nil {
		userPosts.following.Set(followedAddr.String(), &FollowingInfo{
			startedFollowingAt: debugNow(),
			startedPostsCtr:    PostID(postsCtr), // Ignore past messages.
		})
		followedUserPosts.followers.Set(userPosts.userAddr.String(), "")
	}
}

// Remove followedAddr from following.
// If there is a UserPosts for followedAddr, then remove this user from its followers.
// If there is no UserPosts for followedAddr, then do nothing. (We don't expect this usually.)
func (userPosts *UserPosts) Unfollow(followedAddr std.Address) {
	userPosts.following.Remove(followedAddr.String())

	followedUserPosts := getUserPosts(followedAddr)
	if followedUserPosts != nil {
		followedUserPosts.followers.Remove(userPosts.userAddr.String())
	}
}

// Renders the userPosts for display suitable as plaintext in
// console.  This is suitable for demonstration or tests,
// but not for prod.
func (userPosts *UserPosts) RenderUserPosts(includeFollowed bool) string {
	str := ""
	followers := strconv.Itoa(userPosts.followers.Size()) + " Followers"
	following := "Following " + strconv.Itoa(userPosts.following.Size())
	user := users.GetUserByAddress(userPosts.userAddr)
	if user != nil {
		followers = "[" + followers + "](/r/berty/social:" + user.Name + "/followers)"
		following = "[" + following + "](/r/berty/social:" + user.Name + "/following)"
	}
	str += followers + " &nbsp;" + following + "\n\n"

	str += "\\[[post](" + userPosts.GetPostFormURL() + ")] \\[[follow](" + userPosts.GetFollowFormURL() + ")]"
	if includeFollowed {
		str += " \\[[refresh](" + userPosts.GetRefreshFormURL() + ")]"
	}
	str += "\n\n"

	var posts *avl.Tree
	if includeFollowed {
		posts = &userPosts.homePosts
	} else {
		posts = &userPosts.threads
	}
	posts.Iterate("", "", func(key string, postI interface{}) bool {
		str += "----------------------------------------\n"
		str += postI.(*Post).RenderSummary() + "\n"
		return false
	})

	return str
}

func (userPosts *UserPosts) RenderFollowers() string {
	str := ""
	user := users.GetUserByAddress(userPosts.userAddr)
	if user != nil {
		str += "[@" + user.Name + "](/r/berty/social:" + user.Name + ") "
	}
	str += "Followers\n\n"

	// List the followers, sorted by name.
	names := []string{}
	userPosts.followers.Iterate("", "", func(key string, value interface{}) bool {
		if user := users.GetUserByAddress(std.Address(key)); user != nil {
			names = append(names, user.Name)
		}
		return false
	})
	sort.Strings(names)
	for _, name := range names {
		str += " * [@" + name + "](/r/berty/social:" + name + ")" + "\n"
	}

	return str
}

func (userPosts *UserPosts) RenderFollowing() string {
	str := ""
	user := users.GetUserByAddress(userPosts.userAddr)
	if user != nil {
		str += "[@" + user.Name + "](/r/berty/social:" + user.Name + ") "
	}
	str += "Following\n\n"

	// List the following, sorted by name/addr.
	nameAddrs := []string{}
	userPosts.following.Iterate("", "", func(addr string, infoI interface{}) bool {
		info := infoI.(*FollowingInfo)
		if user := users.GetUserByAddress(std.Address(addr)); user != nil {
			nameAddrs = append(nameAddrs, user.Name+"/"+addr+"/"+info.startedFollowingAt.Format("2006-01-02"))
		}
		return false
	})
	sort.Strings(nameAddrs)
	for _, nameAddr := range nameAddrs {
		parts := strings.Split(nameAddr, "/")
		name := parts[0]
		addr := parts[1]
		since := parts[2]
		str += " * [@" + name + "](/r/berty/social:" + name + ") since " + since +
			"  \\[[unfollow](" + userPosts.GetUnfollowFormURL(std.Address(addr)) + ")]\n"
	}

	return str
}

func (userPosts *UserPosts) incGetPostID() PostID {
	postsCtr++
	return PostID(postsCtr)
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

func (userPosts *UserPosts) GetFollowFormURL() string {
	return "/r/berty/social?help&__func=Follow" +
		"&followedAddr=" + userPosts.userAddr.String()
}

func (userPosts *UserPosts) GetUnfollowFormURL(followedAddr std.Address) string {
	return "/r/berty/social?help&__func=Unfollow" +
		"&followedAddr=" + followedAddr.String()
}

func (userPosts *UserPosts) GetRefreshFormURL() string {
	return "/r/berty/social?help&__func=RefreshHomePosts" +
		"&userPostsAddr=" + userPosts.userAddr.String()
}

// Scan userPosts.following for all posts from all followed users starting from lastRefreshId+1 .
// Add the posts to the homePosts avl.Tree, which is sorted by the post ID which is unique for every post and
// increases in time. When finished, update lastRefreshId.
func (userPosts *UserPosts) refreshHomePosts() {
	minStartKey := postIDKey(userPosts.lastRefreshId + 1)

	userPosts.following.Iterate("", "", func(followedAddr string, infoI interface{}) bool {
		followedUserPosts := getUserPosts(std.Address(followedAddr))
		if followedUserPosts == nil {
			return false
		}

		info := infoI.(*FollowingInfo)
		startKey := minStartKey
		if info.startedPostsCtr > userPosts.lastRefreshId {
			// Started following after the last refresh. Ignore messages before started following.
			startKey := postIDKey(info.startedPostsCtr + 1)
		}

		followedUserPosts.threads.Iterate(startKey, "", func(id string, postI interface{}) bool {
			userPosts.homePosts.Set(id, postI.(*Post))
			return false
		})

		return false
	})

	userPosts.lastRefreshId = PostID(postsCtr)
}

// MarshalJSON implements the json.Marshaler interface.
func (userPosts *UserPosts) MarshalJSON() ([]byte, error) {
	json := new(bytes.Buffer)
	json.WriteString(ufmt.Sprintf(`{"address": "%s", "url": %s, "n_threads": %d, "n_followers": %d, "n_following": %d}`,
		userPosts.userAddr.String(), strconv.Quote(userPosts.url), userPosts.threads.Size(),
		userPosts.followers.Size(), userPosts.following.Size()))

	return json.Bytes(), nil
}
