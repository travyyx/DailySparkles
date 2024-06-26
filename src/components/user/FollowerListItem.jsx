/* eslint-disable react/prop-types */
import {useState, useEffect } from 'react'
import { db, app } from '../../config'
import { getAuth } from 'firebase/auth';
import { query, collection, onSnapshot, where, doc, arrayRemove, arrayUnion, getDoc, updateDoc} from 'firebase/firestore'
import { useNavigate } from 'react-router-dom'

function FollowerListItem({id}) {
    const [user, setUser] = useState()
    const [follower, setFollower] = useState()
    const navigate = useNavigate()
    const [ isFollowing, setIsFollowing ] = useState(false)
    const auth = getAuth()

    useEffect(() => {

        const unsubscribe = auth.onAuthStateChanged((user) => {
          if (user) {
            setUser(user)
          }
          else {
            navigate("/")
          }
        })
    
        return () => unsubscribe()
      }, [auth, navigate]);

    const getFollowerData = async() => {
        const q = query(collection(db, "users"), where("id", "==", id))
        const unsub = onSnapshot(q, (querySnapshot) => {
            querySnapshot.forEach((doc) => {
                setFollower(doc.data())
                })
            })

            return () => unsub()
                }

        const getFollowState = async() => {
            const auth = getAuth(app)
            const userdata = auth.currentUser
            const docRef = doc(db, "users", userdata.uid);
            const docSnap = await getDoc(docRef);

            if (docSnap.data().following.includes(id)) {
                setIsFollowing(true)
            } else {
                setIsFollowing(false)
             }
              
        }
        useEffect(() => {
            getFollowerData()
            getFollowState()
        }, [])

        const FollowUser = async() => {
            if (!isFollowing) {
              const docRef = doc(db, "users", user.uid);
              await updateDoc(docRef, {
                following: arrayUnion(id)
            });
            const authorRef = doc(db, "users", id);
            await updateDoc(authorRef, {
              followers: arrayUnion(user.uid)
          });
            } else {
              const docRef = doc(db, "users", user.uid);
              await updateDoc(docRef, {
                following: arrayRemove(id)
            });
            const authorRef = doc(db, "users", id);
            await updateDoc(authorRef, {
              followers: arrayRemove(user.uid)
          });
            }
            getFollowState()
        }

        const MoveToUser = async() => {
          const auth = getAuth(app)
          const user = auth.currentUser
          if (id === user.uid) {
              navigate("/profile")
          }
          else {
              navigate(`/user/${id}`)
          }
        }

    return (
        <div className="w-full border-neutral-900 flex gap-2 p-2 items-center mt-4 rounded-md border-2">
            <div className="w-full flex items-center gap-2">
            <img src={follower && follower.photoURL} alt="follower picture" className="rounded-full w-8 h-8" />
            <h1 className="text-xl ml-1 cursor-pointer hover:underline" onClick={MoveToUser}>{follower && follower.name}</h1>
            </div>
            { user && id != user.uid && (
              ( !isFollowing ? (<button className="bg-blue-500 px-2 py-1 mr-2 rounded-sm hover:bg-blue-700 transition-colors duration-200 text-sm" onClick={FollowUser}>Follow</button>) :(
                <button className=" bg-red-600 px-2 py-1 mr-2 rounded-sm hover:bg-red-700 transition-colors duration-200 text-sm" onClick={FollowUser}>Unfollow</button>
            ))
            )}
        </div>
    )
}

export default FollowerListItem;