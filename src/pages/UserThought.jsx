/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import { ArrowLeft, Heart, Home, Share } from "lucide-react"
import { useParams } from "react-router-dom"
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAuth, signOut } from 'firebase/auth'
import  { app, db } from '../config'
import { query, collection, onSnapshot, where, increment, doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore'
import { AlertItem } from '../components/PostingModal'

function UserThought() {
    const [user, setUser] = useState(null)
    const [ thought, setThought ] = useState(null)
    const [ liked, setLiked ] = useState(null)
    const [alertType, setAlertType] = useState("")
    const [author, setAuthor] = useState(null)
    const navigate = useNavigate()
    const auth = getAuth()
    const params = useParams()
    const delay = (milliseconds) => new Promise(resolve => setTimeout(resolve, milliseconds));

    
    useEffect(() => {
        const auth = getAuth(app)
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

      useEffect(() => {
        const q = query(collection(db, "thoughts"));
  
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const ThoughtsList = [];
            querySnapshot.forEach((doc) => {
                ThoughtsList.push(doc.data());
            });
            GetUserThoughts(ThoughtsList)
        })
  
        return () => unsubscribe()
      }, []);

      const getUserLikes = async() => {

        const auth = getAuth(app)
        const userdata = auth.currentUser
  
        const q = query(collection(db, "users"), where("id", "==", userdata.uid))
  
        const unsub = await onSnapshot(q, (querySnapshot) => {
          querySnapshot.forEach((doc) => {
            if (doc.data().liked.includes(params.id)) {
                setLiked(true)
            }
            else {
                setLiked(false)
            }
          })
        })
        
        return () => unsub()
      }

      const getAuthorData = async(authorId) => {

  
        const q = query(collection(db, "users"), where("id", "==", authorId))
  
        const unsub = await onSnapshot(q, (querySnapshot) => {
          querySnapshot.forEach((doc) => {
            setAuthor(doc.data())
          })
        })

        
        return () => unsub()
      }

      useEffect(() => {
        getUserLikes()
      })

      useEffect(() => {
        if (thought) {
            getAuthorData(thought[0].author)
        }
      })

      const GetUserThoughts = async(list) => {
        const NewFinded = list.filter((item) => item.id.toLowerCase() === params.id.toLowerCase())

          setThought(NewFinded)

        }

        const MoveBack = async() => {
            navigate("/thoughts")
        }
    
        const MoveToHome = async() => {
            navigate("/home")
        }

        const LikeThought = async() => {
            if (!liked) {
                const thoughtRef = doc(db, "thoughts", thought[0].title);

// Set the "capital" field of the city 'DC'
                await updateDoc(thoughtRef, {
                likes: increment(1)
                });

                const userRef = doc(db, "users", user.uid);

// Atomically add a new region to the "regions" array field.
                await updateDoc(userRef, {
                    liked: arrayUnion(params.id)
                });


            }

            else {
                const thoughtRef = doc(db, "thoughts", thought[0].title);

                // Set the "capital" field of the city 'DC'
                await updateDoc(thoughtRef, {
                    likes: increment(-1)
                });
                
                const userRef = doc(db, "users", user.uid);
                
                // Atomically add a new region to the "regions" array field.
                await updateDoc(userRef, {
                    liked: arrayRemove(params.id)
                });
            }
        }

        const copyLink = async() => {
            await navigator.clipboard.writeText(window.location.href);
            setAlertType("copied")
            delay(5000).then(() => setAlertType(""))
        }
        const MoveToUser = async() => {
            if (author.id === user.uid) {
                navigate("/home")
            }
            else {
                navigate(`/${author.id}`)
            }
        }

    return (
        <main className="bg-black flex flex-col h-screen w-screen text-white gap-2 items-center justify-center">
            <header className="w-full flex items-center justify-between mt-5">
                <ArrowLeft className=' ml-4 cursor-pointer hover:stroke-blue-500 transition-colors duration-200 md:size-9' onClick={MoveBack}/>
                <h1 className="font-semibold text-2xl sm:text-3xl">{thought && thought[0].title}</h1>
                <Home className=' mr-4 cursor-pointer hover:stroke-blue-500 transition-colors duration-200 md:size-8' onClick={MoveToHome}/>
            </header>
            <div className="w-full h-full md:w-2/4 p-2 items-center justify-center flex flex-col">
                <div className="w-full flex items-center mb-4">
                <div className="flex w-full items-center gap-2">
                    <img src={author && author.photoURL} alt="" className="w-12 h-12 rounded-full"/>
                    <h1 className="text-xl hover:underline cursor-pointer md:text-2xl" onClick={MoveToUser}>{ author && author.name}</h1>
                </div>
            <h1 className="text-lg text-neutral-700 md:text-xl">{thought && thought[0].creationDate}</h1>
                </div>
            <h1 className="md:text-lg w-full">{thought && thought[0].content}</h1>
            <hr className="border-neutral-500/30 w-full mt-4"/>
            <div className="w-full flex mt-4">
                <div className="w-full flex gap-2 items-center">
            <Heart className={ liked ? "cursor-pointer md:size-7 text-red-700 transition-all duration-200" : "cursor-pointer md:size-7 transition-all duration-200"} fill={liked && "#b91c1c"} onClick={LikeThought}/>
            <h1 className="text-lg md:text-xl">{thought && thought[0].likes}</h1>
                </div>
                <button className="w-auto bg-neutral-900 rounded-full p-2 hover:text-green-500 transition-all duration-200"  onClick={copyLink}><Share/></button>
            </div>
            </div>
            { alertType === "copied" && <AlertItem content={"Link copied."} type={"success"}/>}
        </main>
    )
}

export default UserThought