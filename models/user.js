import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true
    },
    image:{
        type:String,
    },
    password:{
        type:String,
        required:true
    }
},{timestamps:true})

export default mongoose.models.User || mongoose.model("User",userSchema)