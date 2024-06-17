import { ArrowLeft, Heart, Home, MessageSquare, Pin, PinOff, Trash2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { CommentModal } from './../components/CommentModal';
import CommentItem from './../components/CommentItem';
import { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import { app, db } from "../config";
import { query, where, onSnapshot, collection, doc, updateDoc, arrayRemove, arrayUnion, increment, getDoc, deleteDoc } from "firebase/firestore";
import { formatDistanceToNow } from "date-fns";
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import useRunOnce from "../useRunOnce";

export function CommentView() {
    const navigate = useNavigate();
    const [author, setAuthor] = useState(null)
    const [commentData, setCommentData] = useState(null)
    const [commentType, setCommentType] = useState(false)
    const [loading, setLoading] = useState(true)
    const [replies, setReplies] = useState([])
    const [isLiked, setIsLiked] = useState(false)
    const [creationDate, setCreationDate] = useState(null);
    const [user, setUser] = useState(null)
    const [error, setError] = useState(false)
    const [replyAuthor, setReplyAuthor] = useState(null)
    const auth = getAuth()
    const params = useParams()
    const [comment, setComment] = useState(false)

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

      const getUserLikes = async() => {

        const auth = getAuth(app)
        const userdata = auth.currentUser
  
        const q = query(collection(db, "users"), where("id", "==",userdata && userdata.uid))
  
        const unsub = await onSnapshot(q, (querySnapshot) => {
          querySnapshot.forEach((doc) => {
            if (doc.data().liked.includes(params.id)) {
                setIsLiked(true)
            }
            else {
                setIsLiked(false)
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

    useRunOnce({
      fn: () => {
        getComment()
      }
    });
    
    
    useEffect(() => {
      if (commentData) {
          getUserLikes()
          getAuthorData(commentData.author)
          const createDate = formatDistanceToNow(commentData.creationDate.toDate(), { includeSeconds: true, addSuffix: true})
          setCreationDate(createDate)
      }
    }, [commentData])

    const MoveToSparkle = async() => {
        navigate(`/sparkle/${params.sparkleId}`)
    }

    const MoveToHome = async() => {
        navigate("/home")
    }

    const LikeThought = async() => {
        if (!isLiked) {
            const thoughtRef = doc(db, "comments", params.id);

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
            const thoughtRef = doc(db, "comments", params.id);

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

    const getComment = async() => {
        const q = query(collection(db, "comments"), where("id", "==", params.id))

        const unsub = await onSnapshot(q, (snapshot) => {
          snapshot.forEach((doc) => {
            setCommentData(doc.data())
            setReplies(doc.data().replies)
          })
        })
        

        return () => unsub()
      }

    
    const ReplyToComment = async() => {
      setComment(true)
      setCommentType("reply")
      const commentRef = doc(db, "comments", params.id)
      const docSnap =  await getDoc(commentRef)
      setCommentData(docSnap.data())
      const authorRef = doc(db, "users", commentData.author)
      const docSnap2 = await getDoc(authorRef)
      setReplyAuthor(docSnap2.data())

    }

    const SetCommentPinState = async() => {
      const commentRef= doc(db, "comments", params.id)
    
      await updateDoc(commentRef, {
        isPinned: commentData && !commentData.isPinned
      })
      getComment()
    }

    const DeleteComment = async() => {
      const sparkleName = window.sessionStorage.getItem("sparkle_name")
      const deleteConfirm = confirm("Are you to delete this comment?")
      if (deleteConfirm) {
        if (isLiked) {
          const thoughtRef = doc(db, "comments", params.id);
  
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

          const commentRef = doc(db, "comments", params.id);
          const docSnap = await getDoc(commentRef)
  
          if (docSnap.data() && !docSnap.data().replies) {
            return
          } else {
            docSnap.data().replies.forEach((reply) => {
              const replyRef = doc(db, "comments", reply);
              deleteDoc(replyRef)
            })
          }
          const sparkleRef = doc(db, "thoughts", sparkleName)
          await updateDoc(sparkleRef, {
            comments: arrayRemove(params.id)
            })
          window.sessionStorage.clear()
          await deleteDoc(commentRef)
          navigate(`/sparkle/${params.sparkleId}`)

        } else {
          const commentRef = doc(db, "comments", params.id);
          const docSnap = await getDoc(commentRef)
  
          if (docSnap.data() && !docSnap.data().replies) {
            return
          } else {
            docSnap.data().replies.forEach((reply) => {
              const replyRef = doc(db, "comments", reply);
              deleteDoc(replyRef)
            })
          }
          const sparkleRef = doc(db, "thoughts", sparkleName)
          await updateDoc(sparkleRef, {
            comments: arrayRemove(params.id)
            })
          await deleteDoc(commentRef)
          window.sessionStorage.clear()
          navigate(`/sparkle/${params.sparkleId}`)
        }
      
      } else {
        return
      }


  }

    return (
        <main className="bg-black flex flex-col h-screen w-screen text-white gap-2 items-center justify-center p-4">
            <header className="w-full flex items-center justify-between md:w-[500px] mt-2">
                <ArrowLeft className="md:size-9 size-7 hover:text-blue-500 transition-all duration-200 cursor-pointer" onClick={MoveToSparkle}/>
                <h1 className="text-xl md:text-2xl font-bold">Comment</h1>
                <Home className="md:size-9 size-7 hover:text-blue-500 transition-all duration-200 cursor-pointer" onClick={MoveToHome}/>
            </header>
            <hr className="border-neutral-800 w-full md:w-[500px]"/>
            <div className="w-full flex items-center justify-between md:w-[500px]">
                <div className="w-full flex items-center gap-2">
                    <img src={author && author.photoURL} alt="Profile picture" width={48} height={48} className="rounded-full"/>
                    <h1 className="text-lg md:text-xl cursor-pointer hover:underline" onClick={MoveToUser}>{author && author.name}</h1>
                    { commentData && commentData.isPinned && (<Pin className="md:size-7 text-blue-600 fill-blue-600"/>)}
                </div>
                <h1 className="text-lg md:text-xl text-neutral-500 w-full text-right">{creationDate && creationDate}</h1>
            </div>
            <div className="w-full mt-2 md:w-[500px]">
                <Markdown className="w-96 text-lg md:text-xl" remarkPlugins={[remarkGfm]} components={{
              a(props) {
                const {node, ...rest} = props
                return <a className="text-blue-500 " href={rest.href} target="_blank">{rest.href}</a>
              }
            }}>{commentData && commentData.content}</Markdown>
                <hr className="border-neutral-800 w-full mt-4 mb-2"/>
                <div className="w-full flex justify-between">
                    <div className="flex gap-2 items-center">
                        <Heart className={ isLiked ? "cursor-pointer md:size-7 text-red-700" : "cursor-pointer md:size-7 fill-white"} fill={isLiked  ? "#b91c1c" : "#ffffff"} onClick={LikeThought}/>
                        <h1 className="text-xl md:text-2xl">{commentData && formatNumber(commentData.likes)}</h1>
                    </div>
                    <div className="flex gap-2 items-center">
                    <MessageSquare className="md:size-18 hover:text-green-600 transition-all duration-200 cursor-pointer" onClick={ReplyToComment}/>
                    <h1 className="text-xl md:text-2xl">{commentData && formatNumber(commentData.replies.length)}</h1>
                    </div>
                    <div className="flex gap-2 items-center">
                    { commentData && author && author.id === user.uid && (
                      commentData.isPinned ? (
                        <PinOff className="md:size-7 hover:text-red-600 transition-all duration-200 cursor-pointer" onClick={SetCommentPinState}/>
                      ) :(
                        <Pin className="md:size-7 hover:text-blue-600 duration-200 transition-all cursor-pointer" onClick={SetCommentPinState}/>
                      )
                    )}
                    <Trash2 className="md:size-9 size-7 ml-2 hover:text-red-600 transition-all duration-200 cursor-pointer" onClick={DeleteComment}/>
                    </div>
                </div>
            </div>
            <hr className="border-neutral-800 w-full md:w-[500px]"/>
            <div className="w-full h-full md:w-[500px]">
                <h1 className="w-full text-2xl text-center md:text-3xl mb-2">Replies</h1>
                { replies && replies.length != 0 ? (
                    <ul className="w-full h-[430px] gap-3 flex flex-col overflow-auto [&::-webkit-scrollbar]:w-0">
                  { replies.map((reply) => {
                return (<CommentItem key={reply} commentId={reply} ReplyTo={null} sparkleId={params.sparkleId} sparkleAuthor={author && author.id}/>)
                })}
                    </ul>
                ) : (
                    <div className="w-full flex border h-[470px] rounded-lg border-neutral-800 items-center justify-center">
                        <h1 className="text-2xl md:text-3xl text-neutral-500">No replies yet.</h1>
                    </div>
                )}
            </div>
            { comment && commentType === "reply" && (<CommentModal onClose={() => setComment(false)} type={"reply"} commentId={commentData && commentData.id} authorName={replyAuthor && replyAuthor.name}/>)}
        </main>
    )
}