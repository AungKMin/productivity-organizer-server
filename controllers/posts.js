import PostMessage from '../models/postMessage.js';
import User from '../models/user.js';
import mongoose from 'mongoose';

// functions for "posts" routes

export const getPost = async (req, res) => { 
    const { id } = req.params;

    if (!(mongoose.Types.ObjectId.isValid(id) && new mongoose.Types.ObjectId(id).toString() === id)) { 
        return res.status(404).send('No post with that id');
    } 

    try { 
        const post = await PostMessage.findById(id);

        res.status(200).json(post);
    } catch (error) { 
        console.log(error);
        res.status(404).json({ message: error.message });
    }
}

export const getPosts = async (req, res) => {
    const { page } = req.query; 

    try {
        const LIMIT = 8; // max number of posts per page
        const startIndex = (Number(page) - 1) * LIMIT; // starting index of posts in given page
        const totalNumPosts = await PostMessage.countDocuments({});

        const posts = await PostMessage.find().sort({ _id: -1 }).limit(LIMIT).skip(startIndex);
        
        // everything okay (200), send a JSON response
        res.status(200).json({ data: posts, currentPage: Number(page), numberOfPages: Math.ceil(totalNumPosts/LIMIT) });
    } catch (error) {
        // error (404)
        res.status(404).json({ message: error.message });
    }
}

export const getPostsByUser = async (req, res) => { 

    const { page } = req.query;

    if (!req?.userId) { 
        return res.json({ data: [], currentPage: Number(page), numberOfPages: 0 }); // return an empty array
    }
    
    try { 
        const LIMIT = 2; // max number of posts per page
        const startIndex = (Number(page) - 1) * LIMIT; // starting index of posts in given page
        const user = await User.findById(req.userId);
        const totalNumPosts = user.posts.length;
        let posts = []; 

        for (let postIdIndex = totalNumPosts - 1 - (startIndex); postIdIndex > totalNumPosts - 1 - (startIndex) - LIMIT; postIdIndex--) {
            if (postIdIndex >= user.posts.length || postIdIndex < 0) { 
                break;
            } 
            const post = await PostMessage.findById(user.posts[postIdIndex]);
            posts.push(post);
        }

        res.status(200).json({ data: posts, currentPage: Number(page), numberOfPages: Math.ceil(totalNumPosts/LIMIT) });

    } catch (error) { 
        res.status(404).json({ message: error.message });
        console.log(error);
    }

}

export const getPostsBySearchAndUser = async (req, res) => { 

    const { searchQuery, tags } = req.query;

    if (!req?.userId) { 
        return res.json({ data: [], currentPage: 0, numberOfPages: 0 }); // return an empty array
    }

    try { 
        const title = new RegExp(searchQuery, 'i');

        // search for posts that either match the title or whose tags contain one of the desired tags
        let posts = await PostMessage.find({ $or: [ { title }, { tags: { $in: tags.split(",") } } ] });

        posts = posts.filter(post => post.creator === req.userId);

        res.json({ data: posts });
    } catch (error) { 
        console.log(error);
        res.status(404).json({ message: error.message }); 
    }
}

export const getPostsBySearch = async (req, res) => { 

    const { searchQuery, tags } = req.query;

    try { 
        const title = new RegExp(searchQuery, 'i');

        // search for posts that either match the title or whose tags contain one of the desired tags
        const posts = await PostMessage.find({ $or: [ { title }, { tags: { $in: tags.split(",") } } ] });

        res.json({ data: posts });
    } catch (error) { 
        res.status(404).json({ message: error.message }); 
    }
}

export const createPost = async (req, res) => { 
    // body from input
    const post = req.body;

    if (!req.userId) { 
        return res.json( { message: 'Unauthenticated'} );
    } 
    
    const newPost = new PostMessage({ ...post, creator: req.userId, createdAt: new Date().toISOString() });

    try {
        await newPost.save();

        const user = await User.findById(req.userId);
        user.posts.push(newPost._id);

        await User.findByIdAndUpdate(user._id, user, { new: true });

        // successful creation (201), send JSON response
        res.status(201).json(newPost);
    } catch (error) {
        // error due to conflict with current state (409)
        res.status(409).json({ message: error.message });
    }
}

export const updatePost = async (req, res) => { 
    const { id: _id } = req.params;
    const post = req.body;

    if (!req.userId) { 
        return res.json( { message: 'Unauthenticated'} );
    } 

    if (!(mongoose.Types.ObjectId.isValid(_id) && new mongoose.Types.ObjectId(_id).toString() === _id)) { 
        return res.status(404).send('No post with that id');
    } 

    const originalPost = await PostMessage.findById(_id);

    if (post.creator !== req.userId) {
        return res.json(originalPost);
    } 

    const updatedPost = await PostMessage.findByIdAndUpdate(_id, { ...post, _id } , { new: true });

    res.json(updatedPost);
}

export const deletePost = async (req, res) => { 
    const { id: _id } = req.params;

    if (!req.userId) { 
        return res.json( { message: 'Unauthenticated'} );
    } 
    
    if (!(mongoose.Types.ObjectId.isValid(_id) && new mongoose.Types.ObjectId(_id).toString() === _id)) { 
        return res.status(404).send('No post with that id');
    } 

    const post = await PostMessage.findById(_id);

    if (post.creator === req.userId) {
        await PostMessage.findByIdAndRemove(_id);
        let creator = await User.findById(post.creator);
        creator.posts = creator.posts.filter(item => item != _id);
        await User.findByIdAndUpdate(post.creator, creator, { new: true });
    } else { 
        return res.json({ message: 'User does not have permission to delete this post.' });
    }

    res.json({ message: 'Post deleted successfully' });
}

export const likePost = async (req, res) => { 
    const {id : _id} = req.params;

    if (!req.userId) { 
        return res.json( { message: 'Unauthenticated'} );
    } 

    if (!(mongoose.Types.ObjectId.isValid(_id) && new mongoose.Types.ObjectId(_id).toString() === _id)) { 
        return res.status(404).send('No post with that id');
    } 

    const post = await PostMessage.findById(_id);

    const index = post.likes.findIndex((id) => id === String(req.userId));

    if (index === -1) { 
        // user likes the post
        post.likes.push(req.userId);
    } else { 
        // user dislikes the post 
        post.likes = post.likes.filter((id) => id !== String(req.userId));
    }

    const updatedPost = await PostMessage.findByIdAndUpdate(_id, post, { new: true });

    res.json(updatedPost);
}

export const commentPost = async (req, res) => { 
    const { id } = req.params;
    const { value } = req.body;

    if (!req.userId) { 
        return res.json({ message: 'Unauthenticated!' });
    }

    if (!(mongoose.Types.ObjectId.isValid(id) && new mongoose.Types.ObjectId(id).toString() === id)) { 
        return res.status(404).send('No post with that id');
    } 

    const post = await PostMessage.findById(id);

    post.comments.push(value);

    const updatedPost = await PostMessage.findByIdAndUpdate(id, post, { new: true });

    res.json(updatedPost);
}