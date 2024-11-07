"use client";
import Comment from "@/app/components/Comment";
import axios from "axios";
import { Heart, Send } from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import React, { useState, useEffect, useCallback } from "react";
import { ClipLoader } from "react-spinners";
import { toast } from "react-toastify";

const Pin = () => {
  const [comment, setComment] = useState("");
  const [pin, setPin] = useState({});
  const [morePins, setMorePins] = useState([]);
  const [isLiked, setIsLiked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { id } = useParams();
  const { data: session } = useSession();

  // Memoized fetchPin function
  const fetchPin = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`http://localhost:3000/api/pin/${id}`);
      setPin(response.data.pin);
      const pinLiked = response.data.pin.likes.some(
        (element) => session?.user?.name === element.user
      );
      setIsLiked(pinLiked);
    } catch (err) {
      setError("Failed to load pin data.");
    } finally {
      setLoading(false);
    }
  }, [id, session]);

  const fetchMorePins = useCallback(async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/pin");
      setMorePins(response.data.pins);
    } catch (err) {
      setError("Failed to load more pins.");
    }
  }, []);

  useEffect(() => {
    fetchPin();
    fetchMorePins();
  }, [fetchPin, fetchMorePins]);

  const handlePostComment = async () => {
    if (session && session?.user) {
      const profileImage = session?.user?.image;
      const user = session?.user?.name;
      if (!comment || !profileImage || !user) {
        toast.error("Please add a comment");
        return;
      }
      try {
        const formData = new FormData();
        formData.append("user", user);
        formData.append("comment", comment);
        formData.append("profileImage", profileImage);

        const res = await axios.post(
          `http://localhost:3000/api/comments/${id}`,
          formData,
          {
            headers: { "Content-Type": "application/json" },
          }
        );
        if (res.status === 201) {
          toast.success(res.data.message);
          fetchPin();
          setComment("");
        }
      } catch (error) {
        toast.error(error.response.data.error);
      }
    }
  };

  const handleLikePin = async () => {
    try {
      const response = await axios.post(
        `http://localhost:3000/api/like/${id}`,
        "",
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      toast.success(response.data.message);
      fetchPin();
    } catch (err) {
      toast.error("Internal server error");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[750px]">
        <ClipLoader color="#ef4444" size={120} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[750px] text-red-500 text-xl">
        {error}
      </div>
    );
  }

  return (
    <>
      {pin && pin?.image?.url && morePins ? (
        <div className="min-h-screen py-3 md:py-6">
          <div className="container mx-auto px-4">
            <div className="lg:flex justify-center">
              <div className="w-fit mb-6 lg:mb-0 mx-auto lg:mx-0">
                <Image
                  src={pin?.image?.url}
                  alt="Pin"
                  className="rounded-xl shadow-lg max-h-[600px] object-cover w-auto md:ml-auto"
                  width={300}
                  height={300}
                  priority={true}
                />
              </div>

              <div className="lg:w-1/3 lg:pl-10">
                <div className="flex justify-between items-center mb-6">
                  <Heart
                    onClick={handleLikePin}
                    className={`${
                      isLiked
                        ? "bg-red-500 text-white hover:bg-red-700"
                        : "bg-transparent hover:bg-red-500"
                    } transition-all duration-300 w-10 h-10 p-2 rounded-full`}
                  />
                  <div>
                    <Link
                      href={pin?.image?.url}
                      target="_blank"
                      className="bg-red-500 text-white px-4 py-3 rounded-lg font-semibold"
                    >
                      Download
                    </Link>
                  </div>
                </div>
                <p>
                  {pin?.likes?.length <= 1
                    ? `${pin?.likes?.length} Like`
                    : `${pin?.likes?.length} Likes`}
                </p>

                <div>
                  <h3 className="text-xl font-bold mb-4">
                    {pin?.comments?.length} Comments
                  </h3>
                  <div className="max-h-96 overflow-auto">
                    {pin?.comments?.length > 0 ? (
                      pin.comments.map((element) => (
                        <Comment
                          key={element._id}
                          user={element.user}
                          comment={element.comment}
                          profileImage={element.profileImage}
                        />
                      ))
                    ) : (
                      <p className="font-semibold text-lg">No Comments Yet!</p>
                    )}
                  </div>
                  <div className="mt-4 relative">
                    <input
                      type="text"
                      placeholder="Comment"
                      className="w-full bg-gray-100 p-3 rounded-lg pr-12 focus:outline-red-500"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                    />
                    <Send
                      onClick={handlePostComment}
                      className="absolute right-[16px] top-[14px] text-red-500"
                    />
                  </div>
                </div>
              </div>
            </div>
            <h3 className="mt-10 text-2xl font-semibold">More to Explore</h3>
            <div className="flex space-x-4 overflow-x-auto py-4">
              {morePins.map((element) => (
                <Link href={`/pin/${element._id}`} key={element._id}>
                  <Image
                    width={100}
                    height={100}
                    src={element?.image?.url}
                    alt="Pin"
                    className="w-32 h-32 object-cover rounded-lg shadow-md"
                    priority={true}
                  />
                </Link>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex justify-center items-center min-h-[750px]">
          <ClipLoader color="#ef4444" size={120} />
        </div>
      )}
    </>
  );
};

export default Pin;
