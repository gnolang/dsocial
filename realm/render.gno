package social

import (
	"strconv"
	"strings"

	"gno.land/r/demo/users"
)

func Render(path string) string {
	if path == "" {
		str := "Welcome to GnoSocial!\n\n"

		// List the users who have posted. gUserAddressByName is already sorted by name.
		gUserAddressByName.Iterate("", "", func(name string, value interface{}) bool {
			str += " * [@" + name + "](/r/berty/social:" + name + ")" + "\n"
			return false
		})

		return str
	}

	parts := strings.Split(path, "/")
	if len(parts) == 1 {
		// /r/berty/social:USER_NAME
		user := users.GetUserByName(path)
		if user == nil {
			return "Unknown user: " + path
		}

		userPosts := getUserPosts(user.Address)
		if userPosts == nil {
			return "No posts by: " + path
		}

		return userPosts.RenderUserPosts(false)
	} else if len(parts) == 2 {
		name := parts[0]
		user := users.GetUserByName(name)
		if user == nil {
			return "Unknown user: " + name
		}
		userPosts := getUserPosts(user.Address)
		if userPosts == nil {
			return "No posts by: " + name
		}

		if parts[1] == "home" {
			// /r/berty/social:USER_NAME/home
			return userPosts.RenderUserPosts(true)
		} else if parts[1] == "followers" {
			// /r/berty/social:USER_NAME/followers
			return userPosts.RenderFollowers()
		} else if parts[1] == "following" {
			// /r/berty/social:USER_NAME/following
			return userPosts.RenderFollowing()
		} else {
			// /r/berty/social:USER_NAME/THREAD_ID
			pid, err := strconv.Atoi(parts[1])
			if err != nil {
				return "invalid thread id: " + parts[1]
			}
			thread := userPosts.GetThread(PostID(pid))
			if thread == nil {
				return "thread does not exist with id: " + parts[1]
			}
			return thread.RenderPost("", 5)
		}
	} else if len(parts) == 3 {
		// /r/berty/social:USER_NAME/THREAD_ID/REPLY_ID
		name := parts[0]
		user := users.GetUserByName(name)
		if user == nil {
			return "Unknown user: " + name
		}
		userPosts := getUserPosts(user.Address)
		if userPosts == nil {
			return "No posts by: " + name
		}
		pid, err := strconv.Atoi(parts[1])
		if err != nil {
			return "invalid thread id: " + parts[1]
		}
		thread := userPosts.GetThread(PostID(pid))
		if thread == nil {
			return "thread does not exist with id: " + parts[1]
		}
		rid, err := strconv.Atoi(parts[2])
		if err != nil {
			return "invalid reply id: " + parts[2]
		}
		reply := thread.GetReply(PostID(rid))
		if reply == nil {
			return "reply does not exist with id: " + parts[2]
		}
		return reply.RenderInner()
	} else {
		return "unrecognized path: " + path
	}
}
