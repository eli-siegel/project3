//./services/BookService.js

export const _updatePost = (updatedId, name, type, token) => {
	return fetch(`http://localhost:3001/posts/update/${updatedId}`, {
	    method: 'POST',
	    headers: {
	      'Accept': 'application/json',
	      'Content-Type': 'application/json'
	    },
	    body: JSON.stringify({name, type, token})
	  }).then(res => res.json())
}

export const _loadPosts = () => {
	return fetch("http://localhost:3001/posts", {
        method: "GET",
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      }).then(res => res.json())
}

export const _deletePost = (id, token) => {
    return fetch(`http://localhost:3001/posts/${id}`, {
        method: "POST",
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
	    body: JSON.stringify({token})
      }).then(res => res.json())
}

export const _createPost = (name, type, token) => {
	return fetch("http://localhost:3001/posts", {
	    method: 'POST',
	    headers: {
	      'Accept': 'application/json',
	      'Content-Type': 'application/json'
	    },
	    body: JSON.stringify({name, type, token})
	  }).then(res => res.json())
}