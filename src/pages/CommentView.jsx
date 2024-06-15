import { ArrowLeft, Heart, Home, MessageSquare, Pin, PinOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { CommentModal } from './../components/CommentModal';
import CommentItem from './../components/CommentItem';
import { useState, useEffect } from "react";

export function CommentView() {
    return (
        <main className="bg-black flex flex-col h-screen w-screen text-white gap-2 items-center justify-center p-4">
            <header className="w-full flex items-center justify-between">
                <ArrowLeft/>
                <h1 className="text-xl">Comment</h1>
                <Home/>
            </header>
            <hr className="border-neutral-500 w-full"/>
            <div className="w-full flex items-center justify-between">
                <div className="w-full flex">
                    <img src="" alt="" />
                    <h1 className="text-lg">Author Name</h1>
                    <Pin/>
                    <PinOff/>
                </div>
                <h1 className="text-lg">Date</h1>
            </div>
            <div className="w-full mt-4">
                <h1 className="w-96 text-lg">Content</h1>
                <div className="w-full flex justify-between mt-4">
                    <div className="flex gap-2 items-center">
                        <Heart/>
                        <h1 className="text-xl">0</h1>
                    </div>
                    <div className="flex gap-2 items-center">
                    <Pin/>
                    <PinOff/>
                    <h1 className="text-xl">0</h1>
                    </div>
                    <div className="flex gap-2 items-center">
                    <MessageSquare/>
                    <h1 className="text-xl">0</h1>
                    </div>
                </div>
            </div>
            <hr className="border-neutral-500 w-full"/>
            <div className="w-full h-full">
                <h1 className="w-full text-2xl text-center">Replies</h1>
                <ul></ul>
            </div>
        </main>
    )
}