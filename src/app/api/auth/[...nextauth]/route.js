import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GithubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import connectDB from "../../../../../libs/mongodb";
import User from "../../../../../models/user";
import bcrypt from "bcrypt";

const authOptions = {
    providers:[
        GoogleProvider({
            clientId:process.env.GOOGLE_CLIENT_ID,
            clientSecret:process.env.GOOGLE_CLIENT_SECRET,

        }),
        GithubProvider({
            clientId:process.env.GITHUB_CLIENT_ID,
            clientSecret:process.env.GITHUB_CLIENT_SECRET,
        }),
        CredentialsProvider({
            name:"Credentials",
            credentials:{
                username:{
                    label:"Username",
                    type:"text",
                    placeholder:"Enter your username",
                },
                password:{
                    label:"password", type:"password"
                },
                 authorize: async (credentials)=>{
                   await connectDB();

                    const user = await User.findOne({username: credentials.username});

                    if(!user){
                        console.log("User not found");
                        return null;
                        

                    }

                    const isPasswordMatched = await bcrypt.compare(credentials.password, user.password);
                    if(!isPasswordMatched){
                        return null;
                    }

                    return {
                        name:user.name,
                        email:user.email,
                        image:user.image,
                    }
                 }
            }
        })
    ],
    pages:{
        signIn:"/signin"
    }
}

const handler = NextAuth(authOptions);
export {handler as GET, handler as POST};
