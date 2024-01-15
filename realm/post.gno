package gnosocial

import (
	"std"
	"strconv"
	"time"

	"gno.land/p/demo/avl"
)

//----------------------------------------
// Post

// NOTE: a PostID is relative to the userPosts.
type PostID uint64

func (pid PostID) String() string {
	return strconv.Itoa(int(pid))
}

// A Post is a "thread" or a "reply" depending on context.
// A thread is a Post of a UserPosts that holds other replies.
// This is similar to boards.Post except that this doesn't have a title.
type Post struct {
	userPosts  *UserPosts
	id         PostID
	creator    std.Address
	body       string
	replies    avl.Tree    // Post.id -> *Post
	repliesAll avl.Tree    // Post.id -> *Post (all replies, for top-level posts)
	reposts    avl.Tree    // UserPosts user std.Address -> Post.id
	threadID   PostID      // original Post.id
	parentID   PostID      // parent Post.id (if reply or repost)
	repostUser std.Address // UserPosts user std.Address of original post (if repost)
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
		createdAt:  time.Now(),
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
	post.reposts.Set(creator.String(), pid)
	return repost
}

func (thread *Post) GetReply(pid PostID) *Post {
	pidkey := postIDKey(pid)
	replyI, ok := thread.repliesAll.Get(pidkey)
	if !ok {
		return nil
	} else {
		return replyI.(*Post)
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
	str += " \\[[reply](" + post.GetReplyFormURL() + ")]"
	if post.IsThread() {
		str += " \\[[repost](" + post.GetRepostFormURL() + ")]"
	}
	str += "\n"
	if levels > 0 {
		if post.replies.Size() > 0 {
			post.replies.Iterate("", "", func(key string, value interface{}) bool {
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
