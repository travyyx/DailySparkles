/* eslint-disable no-unused-vars */
import { useForm } from 'react-hook-form';
import { X } from 'lucide-react'
import { useState, useEffect } from 'react';
import { app, db } from '../config';
import { getAuth } from 'firebase/auth';
import { collection, getDoc, getDocs, onSnapshot, query, where } from 'firebase/firestore';


// Import the editor styles
// eslint-disable-next-line react/prop-types
export function CommentModal({onClose, type}) {
    const { register, handleSubmit, formState: {errors},  watch} = useForm();
    const [textContent, setTextContent] = useState("")

    const onSubmit = async(data) => {
        console.log(data.comment)
        onClose()

    }

      useEffect(() => {
        setTextContent(watch("comment"))
      })

    return (
        <div className="fixed inset-0 bg-black backdrop-blur-sm bg-opacity-30 flex flex-col items-center justify-center p-4 sm:p-0 text-white">
            <div className="border-neutral-900 m-4 p-4 rounded w-full md:w-[400px] border-2 bg-neutral-950">
                <div className='flex mb-4 items-center w-full justify-between'>
                <h1 className='text-2xl md:text-3xl'>{type === "comment" ? "Comment Sparkle" : "Reply to the comment"}</h1>
                <X size={32} id='close' className='cursor-pointer hover:text-red-500 transition-colors duration-200' onClick={onClose}/>
                </div>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <label htmlFor="comment" className='text-xl md:text-2xl'>Say what do you think.</label>
                    <textarea name="comment" id="comment" className=" w-full bg-neutral-950 p-2 rounded text-white placeholder:text-neutral-500 caret-neutral-500 text-xl resize-none h-[150px] border-2 border-neutral-900 mt-4" placeholder='Nice sparkle.' {...register("comment", {required: true, maxLength: 100})}></textarea>
                <div className='flex items-center gap-3 mt-2'>
                {textContent && (<><progress className={textContent && textContent.length > 90 ? 'w-full [&::-webkit-progress-bar]:bg-neutral-900 [&::-webkit-progress-bar]:rounded-full [&::-webkit-progress-value]:bg-red-500 [&::-webkit-progress-value]:rounded-full [&::-webkit-progress-value]:transition-all [&::-webkit-progress-value]:duration-200' : 'w-full [&::-webkit-progress-bar]:bg-neutral-900 [&::-webkit-progress-bar]:rounded-full [&::-webkit-progress-value]:bg-blue-500 [&::-webkit-progress-value]:rounded-full [&::-webkit-progress-value]:transition-all [&::-webkit-progress-value]:duration-200 '} value={textContent.length} max={100}></progress>
                      <h1>{textContent ? textContent.length : "0"}/100</h1></>)}
                </div>
                <div className='flex items-center justify-end my-4'>
                    <button type='submit' className='text-lg bg-white text-black rounded p-2 right-0'>{type === "comment" ? "Comment" : "Reply"}</button>
                </div>
                </form>
            </div>
        </div>   
                        
    )
}