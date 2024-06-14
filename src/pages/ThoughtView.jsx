/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import { Eye, Heart, Home, Share, UserCircleIcon, MessageSquare } from "lucide-react"
import { useParams } from "react-router-dom"
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAuth } from 'firebase/auth'
import  { app, db } from '../config'
import { query, collection, onSnapshot, where, increment, doc, updateDoc, arrayUnion, arrayRemove, getDoc } from 'firebase/firestore'
import { AlertItem } from '../components/AlertItem'
import { formatDistanceToNow } from "date-fns";
import CommentItem from "../components/CommentItem"
import { CommentModal } from "../components/CommentModal"

function UserThought() {
    const [user, setUser] = useState(null)
    const [ thought, setThought ] = useState(null)
    const [ liked, setLiked ] = useState(null)
    const [creationDate, setCreationDate] = useState(null);
    const [alertType, setAlertType] = useState("")
    const [author, setAuthor] = useState(null)
    const [isViewed, setIsViewed] = useState(false)
    const navigate = useNavigate()
    const [error, setError] = useState(false)
    const [loading, setLoading] = useState(true)
    const [comment, setComment] = useState(false)
    const [type, setType] = useState("comment")
    const [comments, setComments] = useState([])
    const [commentData, setCommentData] = useState(null)
    const [replyAuthor, setReplyAuthor] = useState(null)
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
        try {
        const q = query(collection(db, "thoughts"));
  
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const ThoughtsList = [];
            querySnapshot.forEach((doc) => {
                ThoughtsList.push(doc.data());
            });
            GetUserThoughts(ThoughtsList)
            setLoading(false)
        })
      
            return () => unsubscribe()
      } catch {
        setError(true)
        }
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
            getAuthorData(thought[0].author_id)
            const createDate = formatDistanceToNow(thought[0].createdAt.toDate(), { includeSeconds: true, addSuffix: true})
            setCreationDate(createDate)
        }
      })

      useEffect(() => {
        if (thought) {
          viewThought(thought[0].title)
        }
      }, [thought])

      const getComments = async() => {
        const q = query(collection(db, "thoughts"), where("id", "==", params.id))

        const unsub = await onSnapshot(q, (snapshot) => {
          snapshot.forEach((doc) => {
            setComments(doc.data().comments)
          })
        })

        return () => unsub()
      }

      useEffect(() => {
        getComments()
      }, [])



      const GetUserThoughts = async(list) => {
        const NewFinded = list.filter((item) => item.id.toLowerCase() === params.id.toLowerCase())

          setThought(NewFinded)

        }
        
        const viewThought = async(name) => {
          const docRef = doc(db, "thoughts", name);
      
          if (isViewed) {
            return
          } else {
            setIsViewed(true)
            await updateDoc(docRef, {
              views: increment(1)
              });
          }
          
        }
          
        const MoveToProfile = async() => {
            navigate("/profile")
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
                const auth = getAuth(app)
                const userdata = auth.currentUser
                const userRef = doc(db, "users", userdata.uid);

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
                const auth = getAuth(app)
                const userdata = auth.currentUser
                const userRef = doc(db, "users", userdata.uid);
                
                // Atomically add a new region to the "regions" array field.
                await updateDoc(userRef, {
                    liked: arrayRemove(params.id)
                });
            }
            getUserLikes()
        }

        const copyLink = async() => {
            await navigator.clipboard.writeText(window.location.href);
            setAlertType("copied")
            delay(5000).then(() => setAlertType(""))
        }
        const MoveToUser = async() => {
            if (author.id === user.uid) {
                navigate("/profile")
            }
            else {
                navigate(`/${author.id}`)
            }
        }

        function formatNumber(count) {
          if (count < 1000) {
            return count.toString();
          } else if (count < 1000000) {
            return (count / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
          } else if (count < 1000000000) {
            return (count / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
          } else {
            return (count / 1000000000).toFixed(1).replace(/\.0$/, '') + 'B';
          }
        }
        
        const ReplyToComment = async(comment) => {
          setComment(true)
          setType("reply")
          console.log(comment)
          const commentRef = doc(db, "comments", comment)
          const docSnap =  await getDoc(commentRef)
          await setCommentData(docSnap.data())
          console.log(commentData)
          const authorRef = doc(db, "users", commentData.author)
          const docSnap2 = await getDoc(authorRef)
          await setReplyAuthor(docSnap2.data())
          console.log(replyAuthor)

        }
        

    return (
        <main className="bg-black flex flex-col h-screen w-screen text-white gap-2 items-center justify-center">
            { !loading ? (<><header className="w-full flex items-center justify-between mt-5">
                <UserCircleIcon className=' ml-4 cursor-pointer hover:stroke-blue-500 transition-colors duration-200 md:size-9 size-7' onClick={MoveToProfile}/>
                { thought && (<h1 className="font-semibold max-sm:text-2xl md:text-3xl text-center max-sm:truncate w-72 md:w-auto text-2xl">{thought && thought[0].title}</h1>)}
                <Home className=' mr-4 cursor-pointer hover:stroke-blue-500 transition-colors duration-200 md:size-8' onClick={MoveToHome}/>
            </header>
            <div className="w-full h-full md:w-2/4 p-2 items-center flex flex-col mt-4">
                <div className="w-full flex items-center mb-4">
                <div className="flex w-full items-center gap-2">
                    <img src={author && author.photoURL} alt="" className="w-12 h-12 rounded-full"/>
                    <h1 className="text-xl hover:underline cursor-pointer md:text-2xl" onClick={MoveToUser}>{ author && author.name}</h1>
                </div>
            <h1 className="w-full text-right text-lg text-neutral-700 md:text-xl">{creationDate && creationDate}</h1>
                </div>
            <h1 className="md:text-xl w-full text-lg">{thought && thought[0].content}</h1>
            <hr className="border-neutral-500/30 w-full mt-4"/>
            <div className="w-full flex mt-4">
                <div className="w-full flex gap-2 items-center">
            <Heart className={ liked ? "cursor-pointer md:size-7 text-red-700" : "cursor-pointer md:size-7"} fill={liked  ? "#b91c1c" : undefined} onClick={LikeThought}/>
            <h1 className="text-lg md:text-xl">{thought && formatNumber(thought[0].likes)}</h1>
            <Eye className="ml-4"/>
            <h1 className="text-lg md:text-xl">{thought && formatNumber(thought[0].views)}</h1>
            <MessageSquare className="ml-4 cursor-pointer hover:text-green-500 transition-colors duration-200" onClick={() => {
              setComment(true)
              setType("comment")
            }}/>
            <h1 className="text-lg md:text-xl">{comments && formatNumber(comments.length)}</h1>
                </div>
                <button className="w-auto bg-neutral-900 rounded-full p-2 hover:text-green-500 transition-all duration-200"  onClick={copyLink}><Share/></button>
            </div>
            <hr className="border-neutral-500/30 w-full mt-4"/>
            <h1 className="w-full p-4 text-2xl text-center">Comments.</h1>
            { comments && comments.length === 0 ? (
                              <div className='w-full flex items-center justify-center border-neutral-900 border-2 rounded-md mt-4 h-full mb-2'>
                              <h1 className='text-2xl text-neutral-600 text-center'>No comments yet.</h1>
                          </div>
            ) : (
              <ul className="w-full h-[430px] gap-3 flex flex-col overflow-auto [&::-webkit-scrollbar]:w-0">
                { comments.map((comment) => {
                return (<CommentItem key={comment} commentId={comment} ReplyTo={() => ReplyToComment(comment)} sparkleId={params.id} sparkleAuthor={author && author.id}/>)
                })}
              </ul>
            )}
            </div></>) : (
              <>
              <div role="status" className='flex w-full items-center justify-center h-full flex-col gap-7'>
            { !error && (<svg aria-hidden="true" className="w-16 h-16 text-gray-200 animate-spin dark:text-neutral-900 fill-white" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
            </svg>)}
            {error && (<h1 className="text-2xl w-96 md:w-[30rem] text-center md:text-3xl">An error occured. Please wait a few and try again.</h1>)}
  
            </div>
            </>
            )}      
            { alertType === "copied" && <AlertItem content={"Link copied."} type={"success"}/>}
            { comment && type === "comment" && (<CommentModal onClose={() => setComment(false)} type={"comment"} SparkleName={thought[0].title} authorName={author.name}/>)}
            { comment && type === "reply" && (<CommentModal onClose={() => setComment(false)} type={"reply"} commentId={commentData && commentData.id} authorName={replyAuthor && replyAuthor.name}/>)}
        </main>
    )
}

export default UserThought