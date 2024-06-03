/* eslint-disable react/prop-types */
import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import FollowingListItem from './FollowingListItem';
import { query, collection, onSnapshot, where} from 'firebase/firestore'
import { db, app } from '../../config'
import { getAuth } from 'firebase/auth';
import { useForm } from "react-hook-form"


function FollowingList({onClose, id}) {
    const [following, setFollowing] = useState([]);
    const { register, handleSubmit} = useForm()

    function getFollowing() {

        const q = query(collection(db, "users"), where("id", "==", id))
  
        const unsub = onSnapshot(q, (querySnapshot) => {
          querySnapshot.forEach((doc) => {
            setFollowing(doc.data().following)
          })
        })
        
        return () => unsub()
    }

    useEffect(() => {
        getFollowing()
    }, [])

    const handleSearch = async(data) => {
        if (data.search === "") {
            getFollowing()
        } else {

            const q = query(collection(db, "users"), where("id", "!=", id))

            const unsub = onSnapshot(q, (querySnapshot) => {
                const searchedFollowing = []
                querySnapshot.forEach((doc) => {
                    if (doc.data().name.toLowerCase().includes(data.search.toLowerCase())) {
                        searchedFollowing.push(doc.data().id)
                        }
                    else {
                        searchedFollowing.push()
                    }
                        })
                        setFollowing(searchedFollowing)
    
            })
            return () => unsub()
        }
    }

    return (
        <div className="fixed inset-0 bg-black backdrop-blur-sm bg-opacity-30 flex flex-col items-center justify-center p-4 sm:p-0 text-white">
        <div className="bg-neutral-900 m-4 p-4 rounded w-full md:w-[500px]">
            <div className='flex w-full items-center justify-between'>
                <h1 className='text-2xl'>Following.</h1>
                <X className='cursor-pointer' onClick={onClose}/>
            </div>
            <form onChange={handleSubmit(handleSearch)} className='flex w-full mt-4'>

                <input type="text" id="searchData" placeholder="Search..." {...register("search")} className="bg-neutral-950 p-1 rounded text-white placeholder:text-neutral-500 caret-neutral-500 text-xl w-full"/>
            </form>
            { following.length != 0 ? (
                <div className='w-full flex flex-col'>
                    <ul className="w-full h-full flex flex-col gap-2 overflow-auto [&::-webkit-scrollbar]:w-0">
                        { following && following.map((follower) => {
                            return <FollowingListItem key={follower} id={follower} />
                        })}
                    </ul>
                </div>
) : (
                <div className='w-full h-64 flex items-center justify-center bg-neutral-950 rounded-md mt-4'>
                    <h1 className='text-2xl text-neutral-600'>Following nobody.</h1>
                </div>
            )}
            </div>
        </div>
    )
}

export default FollowingList