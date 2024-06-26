/* eslint-disable react/prop-types */
import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import FollowerListItem from './FollowerListItem';
import { query, collection, onSnapshot, where} from 'firebase/firestore'
import { db, app } from '../../config'
import { getAuth } from 'firebase/auth';
import { useForm } from "react-hook-form"


function FollowersList({onClose, id}) {
    const [followers, setFollowers] = useState([]);
    const { register, handleSubmit} = useForm()

    function getFollowers() {
  
        const q = query(collection(db, "users"), where("id", "==", id))
  
        const unsub = onSnapshot(q, (querySnapshot) => {
          querySnapshot.forEach((doc) => {
            setFollowers(doc.data().followers)
          })
        })
        
        return () => unsub()
    }

    useEffect(() => {
        getFollowers()
    }, [])

    const handleSearch = async(data) => {
        if (data.search === "") {
            getFollowers()
        } else {

            const q = query(collection(db, "users"), where("id", "!=", id))

            const unsub = onSnapshot(q, (querySnapshot) => {
                const searchedFollowers = []
                querySnapshot.forEach((doc) => {
                    if (doc.data().name.toLowerCase().includes(data.search.toLowerCase())) {
                        searchedFollowers.push(doc.data().id)
                        }
                    else {
                        searchedFollowers.push()
                    }
                        })
                        setFollowers(searchedFollowers)
                        
                    })
                    return () => unsub()
        }
    }

    return (
        <div className="fixed inset-0 bg-black backdrop-blur-sm bg-opacity-30 flex flex-col items-center justify-center p-4 sm:p-0 text-white">
        <div className="bg-neutral-950 m-4 p-4 rounded border-2 border-neutral-900 w-[400px]">
            <div className='flex w-full items-center justify-between'>
                <h1 className='text-2xl'>Followers.</h1>
                <X className='cursor-pointer' onClick={onClose}/>
            </div>
            <form onChange={handleSubmit(handleSearch)} className='flex w-full mt-4'>

                <input type="text" id="searchData" placeholder="Search..." {...register("search")} className="border-neutral-900 p-1 rounded text-white placeholder:text-neutral-500 caret-neutral-500 text-xl w-full bg-transparent border-2"/>
            </form>
            { followers.length != 0 ? (
                <div className='w-full flex flex-col'>
                    <ul className="w-full h-full flex flex-col gap-2 overflow-auto [&::-webkit-scrollbar]:w-0">
                        { followers && followers.map((follower) => {
                            return <FollowerListItem key={follower} id={follower} />
                        })}
                    </ul>
                </div>
) : (
                <div className='w-full h-64 flex items-center justify-center bg-neutral-950 rounded-md mt-4'>
                    <h1 className='text-2xl text-neutral-600'>No followers yet.</h1>
                </div>
            )}
            </div>
        </div>
    )
}

export default FollowersList