
import Pin from "../../../../../models/pin"
import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import connectDB from "../../../../../libs/mongodb";
export async function POST(request, { params }) {
  try {
    connectDB();
    const token = await getToken({ req: request });
    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Please Logged in to Like this post.",
        },
        { status: 401 }
      );
    }

    const { id } = params;
    const pin = await Pin.findById(id);

    if (!pin) {
      return NextResponse.json(
        {
          success: false,
          error: "Pin not found.",
        },
        { status: 404 }
      );
    }

    const userLikedIndex = pin.likes.findIndex(
      (like) => like.user === token.name
    );
    if (userLikedIndex > -1) {
      pin.likes.splice(userLikedIndex, 1);
      await pin.save();
      return NextResponse.json(
        { success: true, message: "Like Removed." },
        { status: 200 }
      );
    } else {
      const newLike = {
        user: token.name,
      };
      pin.likes.push(newLike);
      await pin.save();
      return NextResponse.json(
        { success: true, message: "Pin Liked." },
        { status: 201 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Internal server error." },
      { status: 500 }
    );
  }
}