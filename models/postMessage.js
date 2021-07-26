import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const postSchema = mongoose.Schema({
    title: String, 
    body: Schema.Types.Mixed,
    message: String,
    name: String,
    creator: String,
    tags: [String],
    selectedFile: String,
    likes: { 
        type: [String],
        default: [],
    },
    comments: { 
        type: [String],
        default: [],
    },
    createdAt: {
        type: Date,
        default: new Date()
    },
}, {minimize: false});

const PostMessage = mongoose.model('PostMessage', postSchema);

export default PostMessage;