import mongoose from "mongoose";

const connectDB = async()=>{
    try{
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to database")
    } catch(error){
        console.log(`Some error occur in db ${error}`);
        

    }
}

export default connectDB;