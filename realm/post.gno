package social

import (
	"bytes"
	"std"
	"strconv"
	"time"

	"gno.land/p/demo/avl"
	"gno.land/p/demo/ufmt"
)

var debugNowOffset time.Duration

//----------------------------------------
// Post

// NOTE: a PostID is relative to the userPosts.
type PostID uint64

func (pid PostID) String() string {
	return strconv.Itoa(int(pid))
}

// Reaction is for the "enum" of ways to react to a post
type Reaction int

const (
	Gnod Reaction = iota
	MaxReaction
)

// A Post is a "thread" or a "reply" depending on context.
// A thread is a Post of a UserPosts that holds other replies.
// This is similar to boards.Post except that this doesn't have a title.
type Post struct {
	userPosts  *UserPosts
	id         PostID
	creator    std.Address
	body       string
	replies    avl.Tree    // PostID -> *Post
	repliesAll avl.Tree    // PostID -> *Post (all replies, for top-level posts)
	reposts    avl.Tree    // UserPosts user std.Address -> PostID
	threadID   PostID      // original PostID
	parentID   PostID      // parent PostID (if reply or repost)
	repostUser std.Address // UserPosts user std.Address of original post (if repost)
	reactions  *avl.Tree   // Reaction -> *avl.Tree of std.Address -> "" (Use the avl.Tree keys as the "set" of addresses)
	createdAt  time.Time
}

func newPost(userPosts *UserPosts, id PostID, creator std.Address, body string, threadID, parentID PostID, repostUser std.Address) *Post {
	return &Post{
		userPosts:  userPosts,
		id:         id,
		creator:    creator,
		body:       body,
		replies:    avl.Tree{},
		repliesAll: avl.Tree{},
		reposts:    avl.Tree{},
		threadID:   threadID,
		parentID:   parentID,
		repostUser: repostUser,
		reactions:  avl.NewTree(),
		createdAt:  debugNow(),
	}
}

func (post *Post) IsThread() bool {
	return post.parentID == 0
}

func (post *Post) GetPostID() PostID {
	return post.id
}

func (post *Post) AddReply(creator std.Address, body string) *Post {
	userPosts := post.userPosts
	pid := userPosts.incGetPostID()
	pidkey := postIDKey(pid)
	reply := newPost(userPosts, pid, creator, body, post.threadID, post.id, "")
	post.replies.Set(pidkey, reply)
	if post.threadID == post.id {
		post.repliesAll.Set(pidkey, reply)
	} else {
		thread := userPosts.GetThread(post.threadID)
		thread.repliesAll.Set(pidkey, reply)
	}
	return reply
}

func (post *Post) AddRepostTo(creator std.Address, comment string, dst *UserPosts) *Post {
	if !post.IsThread() {
		panic("cannot repost non-thread post")
	}

	pid := dst.incGetPostID()
	pidkey := postIDKey(pid)
	repost := newPost(dst, pid, creator, comment, pid, post.id, post.userPosts.userAddr)
	dst.threads.Set(pidkey, repost)
	// Also add to the home posts.
	dst.homePosts.Set(pidkey, repost)
	post.reposts.Set(creator.String(), pid)
	return repost
}

func (post *Post) GetReply(pid PostID) *Post {
	pidkey := postIDKey(pid)
	replyI, ok := post.repliesAll.Get(pidkey)
	if !ok {
		return nil
	} else {
		return replyI.(*Post)
	}
}

// Add the userAddr to the posts.reactions for reaction.
// Create the reaction key in post.reactions if needed.
// If userAddr is already added, do nothing.
// If the userAddr is the post's creator, do nothing. (Don't react to one's own posts.)
// Return a boolean indicating whether the userAddr was added (false if it was already added).
func (post *Post) AddReaction(userAddr std.Address, reaction Reaction) bool {
	validateReaction(reaction)

	if userAddr == post.creator {
		// Don't react to one's own posts.
		return false
	}
	value := getOrCreateReactionValue(post.reactions, reaction)
	if value.Has(userAddr.String()) {
		// Already added.
		return false
	}

	value.Set(userAddr.String(), "")
	return true
}

// Remove the userAddr from the posts.reactions for reaction.
// If userAddr is already removed, do nothing.
// Return a boolean indicating whether the userAddr was found and removed.
func (post *Post) RemoveReaction(userAddr std.Address, reaction Reaction) bool {
	validateReaction(reaction)

	if !post.reactions.Has(reactionKey(reaction)) {
		// There is no entry for reaction, so don't create one.
		return false
	}

	_, removed := getOrCreateReactionValue(post.reactions, reaction).Remove(userAddr.String())
	return removed
}

// Return the count of reactions for the reaction.
func (post *Post) GetReactionCount(reaction Reaction) int {
	key := reactionKey(reaction)
	valueI, exists := post.reactions.Get(key)
	if exists {
		return valueI.(*avl.Tree).Size()
	} else {
		return 0
	}
}

func validateReaction(reaction Reaction) {
	if reaction < 0 || reaction >= MaxReaction {
		panic("invalid Reaction value: " + strconv.Itoa(int(reaction)))
	}
}

func (post *Post) GetSummary() string {
	return summaryOf(post.body, 80)
}

func (post *Post) GetURL() string {
	if post.IsThread() {
		return post.userPosts.GetURLFromThreadAndReplyID(
			post.id, 0)
	} else {
		return post.userPosts.GetURLFromThreadAndReplyID(
			post.threadID, post.id)
	}
}

func (post *Post) GetGnodFormURL() string {
	return "/r/berty/social?help&__func=AddReaction" +
		"&userPostsAddr=" + post.userPosts.userAddr.String() +
		"&threadid=" + post.threadID.String() +
		"&postid=" + post.id.String() +
		"&reaction=" + strconv.Itoa(int(Gnod))
}

func (post *Post) GetReplyFormURL() string {
	return "/r/berty/social?help&__func=PostReply" +
		"&userPostsAddr=" + post.userPosts.userAddr.String() +
		"&threadid=" + post.threadID.String() +
		"&postid=" + post.id.String() +
		"&comment.type=textarea"
}

func (post *Post) GetRepostFormURL() string {
	return "/r/berty/social?help&__func=RepostThread" +
		"&userPostsAddr=" + post.userPosts.userAddr.String() +
		"&threadid=" + post.threadID.String() +
		"&postid=" + post.id.String() +
		"&body.type=textarea"
}

func (post *Post) RenderSummary() string {
	if post.repostUser != "" {
		dstUserPosts := getUserPosts(post.repostUser)
		if dstUserPosts == nil {
			panic("repost user does not exist")
		}
		thread := dstUserPosts.GetThread(PostID(post.parentID))
		if thread == nil {
			return "reposted post does not exist"
		}
		return "Repost: " + post.GetSummary() + "\n\n" + thread.RenderSummary()
	}
	str := ""
	str += post.GetSummary() + "\n"
	str += "\\- " + displayAddressMD(post.creator) + ","
	str += " [" + post.createdAt.Format("2006-01-02 3:04pm MST") + "](" + post.GetURL() + ")"
	str += " (" + strconv.Itoa(post.GetReactionCount(Gnod)) + " gnods)"
	str += " (" + strconv.Itoa(post.replies.Size()) + " replies)"
	str += " (" + strconv.Itoa(post.reposts.Size()) + " reposts)" + "\n"
	return str
}

func (post *Post) RenderPost(indent string, levels int) string {
	if post == nil {
		return "nil post"
	}
	str := ""
	str += indentBody(indent, post.body) + "\n" // TODO: indent body lines.
	str += indent + "\\- " + displayAddressMD(post.creator) + ", "
	str += "[" + post.createdAt.Format("2006-01-02 3:04pm (MST)") + "](" + post.GetURL() + ")"
	str += " - (" + strconv.Itoa(post.GetReactionCount(Gnod)) + " gnods) - "
	str += " \\[[gnod](" + post.GetGnodFormURL() + ")]"
	str += " \\[[reply](" + post.GetReplyFormURL() + ")]"
	if post.IsThread() {
		str += " \\[[repost](" + post.GetRepostFormURL() + ")]"
	}
	str += "\n"
	if levels > 0 {
		if post.replies.Size() > 0 {
			post.replies.ReverseIterate("", "", func(key string, value interface{}) bool {
				str += indent + "\n"
				str += value.(*Post).RenderPost(indent+"> ", levels-1)
				return false
			})
		}
	} else {
		if post.replies.Size() > 0 {
			str += indent + "\n"
			str += indent + "_[see all " + strconv.Itoa(post.replies.Size()) + " replies](" + post.GetURL() + ")_\n"
		}
	}
	return str
}

// render reply and link to context thread
func (post *Post) RenderInner() string {
	if post.IsThread() {
		panic("unexpected thread")
	}
	threadID := post.threadID
	// replyID := post.id
	parentID := post.parentID
	str := ""
	str += "_[see thread](" + post.userPosts.GetURLFromThreadAndReplyID(
		threadID, 0) + ")_\n\n"
	thread := post.userPosts.GetThread(post.threadID)
	var parent *Post
	if thread.id == parentID {
		parent = thread
	} else {
		parent = thread.GetReply(parentID)
	}
	str += parent.RenderPost("", 0)
	str += "\n"
	str += post.RenderPost("> ", 5)
	return str
}

// MarshalJSON implements the json.Marshaler interface.
func (post *Post) MarshalJSON() ([]byte, error) {
	createdAt, err := post.createdAt.MarshalJSON()
	if err != nil {
		return nil, err
	}

	json := new(bytes.Buffer)

	json.WriteString(ufmt.Sprintf(`{"id": %d, "createdAt": %s, "creator": "%s", "n_gnods": %d, "n_replies": %d, "n_replies_all": %d, "parent_id": %d`,
		uint64(post.id), string(createdAt), post.creator.String(), post.GetReactionCount(Gnod), post.replies.Size(), post.repliesAll.Size(),
		uint64(post.parentID)))
	if post.repostUser != "" {
		json.WriteString(ufmt.Sprintf(`, "repost_user": %s`, strconv.Quote(post.repostUser.String())))
	}
	json.WriteString(ufmt.Sprintf(`, "body": %s}`, strconv.Quote(post.body)))

	return json.Bytes(), nil
}

func getPosts(posts avl.Tree, startIndex int, endIndex int) string {
	json := ufmt.Sprintf("{\"n_threads\": %d, \"posts\": [\n  ", posts.Size())

	for i := startIndex; i < endIndex && i < posts.Size(); i++ {
		if i > startIndex {
			json += ",\n  "
		}

		_, postI := posts.GetByIndex(i)
		post := postI.(*Post)
		postJson, err := post.MarshalJSON()
		if err != nil {
			panic("can't get post JSON")
		}
		json += ufmt.Sprintf("{\"index\": %d, \"post\": %s}", i, string(postJson))
	}

	json += "]}"
	return json
}

// Until the problem explained in https://github.com/gnolang/gno/issues/1509
// is solved, we need post timestamps to be different on reload. This
// calls Time.Now() and adds an offset which increases by one minute on each call.
// Therefore, in "normal" operation (before reload) the times are close to the
// expected value. After reload, all times will be the time of reload, increasing by
// one minute each, which is not ideal but at least they are different and in order.
func debugNow() time.Time {
	debugNowOffset += time.Minute
	return time.Now().Add(debugNowOffset)
}
