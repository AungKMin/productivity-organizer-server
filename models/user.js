import mongoose from 'mongoose';

const userSchema = mongoose.Schema({
    name: { 
        type: String, 
        required: true
    },
    email: { 
        type: String, 
        required: true
    },
    password: { 
        type: String, 
        required: true
    },
    id: { 
        type: String
    }, 
    posts: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'PostMessage'
        }
    ]
}, {minimize: false});

export default mongoose.model("User", userSchema);