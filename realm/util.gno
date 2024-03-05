package social

import (
	"std"
	"strconv"
	"strings"

	"gno.land/r/demo/users"
)

//----------------------------------------
// private utility methods

// Get the userPosts for the user.
func getUserPosts(userAddr std.Address) *UserPosts {
	userPosts, exists := gUserPostsByAddress.Get(userAddr.String())
	if !exists {
		return nil
	}

	return userPosts.(*UserPosts)
}

func padZero(u64 uint64, length int) string {
	str := strconv.Itoa(int(u64))
	if len(str) >= length {
		return str
	} else {
		return strings.Repeat("0", length-len(str)) + str
	}
}

func postIDKey(pid PostID) string {
	return padZero(uint64(pid), 10)
}

func indentBody(indent string, body string) string {
	lines := strings.Split(body, "\n")
	res := ""
	for i, line := range lines {
		if i > 0 {
			res += "\n"
		}
		res += indent + line
	}
	return res
}

// NOTE: length must be greater than 3.
func summaryOf(str string, length int) string {
	lines := strings.SplitN(str, "\n", 2)
	line := lines[0]
	if len(line) > length {
		line = line[:(length-3)] + "..."
	} else if len(lines) > 1 {
		// len(line) <= 80
		line = line + "..."
	}
	return line
}

func displayAddressMD(addr std.Address) string {
	user := users.GetUserByAddress(addr)
	if user == nil {
		return "[" + addr.String() + "](/r/demo/users:" + addr.String() + ")"
	} else {
		return "[@" + user.Name + "](/r/berty/social:" + user.Name + ")"
	}
}

func usernameOf(addr std.Address) string {
	user := users.GetUserByAddress(addr)
	if user == nil {
		return ""
	} else {
		return user.Name
	}
}
