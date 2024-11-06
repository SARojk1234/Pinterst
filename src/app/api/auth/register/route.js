import cloudinary from "../../../../../libs/cloudinary";

import connectDB from "../../../../../libs/mongodb";
import User from "../../../../../models/user";

import { NextResponse } from "next/server";
import bcrypt from "bcrypt";

export async function POST(req) {
  connectDB();
  const formData = await req.formData();
  const image = formData.get("image");
  const username = formData.get("username");
  const email = formData.get("email");
  const password = formData.get("password");

  if (!image) {
    return NextResponse.json({ error: "No file receiver" }, { status: 400 });
  }

  try {
    const arrayBuffer = await image.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    const uploadedResponse = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream({}, function (error, result) {
          if (error) {
            reject(error);
            return;
          }
          resolve(result);
        })
        .end(buffer);
    });
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      image: uploadedResponse.secure_url,
    });

    return NextResponse.json(
      {
        success: true,
        message: "USer registered",
        user,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("User registration failed");
    return NextResponse.json(
      {
        error: "user registration failed",
      },
      { status: 500 }
    );
  }
}
