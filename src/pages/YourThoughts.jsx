/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import { Search, Home, Pencil, List, User } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAuth } from 'firebase/auth'
import  { app, db } from '../config'
import { query, collection, onSnapshot, setDoc, doc, serverTimestamp, getDoc, deleteDoc, orderBy, arrayUnion,updateDoc, arrayRemove, getDocs, increment } from 'firebase/firestore'
import { useForm } from "react-hook-form"
import ThoughtItem from '../components/ThoughtItem'
import { format, formatDistanceToNowStrict } from "date-fns"
import { AlertItem } from '../components/AlertItem'


function ThoughtsPage() {

    const navigate = useNavigate()
    const { register, handleSubmit, resetField, formState: {errors}, watch } = useForm()
    const auth = getAuth()
    const [thoughts, setThoughts] = useState([])
    const [open, setOpen] = useState(false)
    const [textContent, setTextContent] = useState("")
    const [alertType, setAlertType] = useState("")
    const [ dailyThoughts, setDailyThoughts ] = useState(0)
    const [ topics, setTopics ] = useState([])
    const [isChecked, setIsChecked] = useState(false)
    const [user, setUser] = useState(null)
    const [error, setError] = useState(false)
    const [loading, setLoading] = useState(true)
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

      const GetThoughts = async() => {
        try {

          const q = query(collection(db, "thoughts"), orderBy("createdAt", "desc"));
  
          const unsubscribe = await onSnapshot(q, (querySnapshot) => {
              const ThoughtsList = [];
              querySnapshot.forEach((doc) => {
                  ThoughtsList.push(doc.data());
              });
              GetUserThoughts(ThoughtsList)
          })
        } catch {
setError(true)
        }
      }

      const GetUserThoughts = async(list) => {
        const auth = getAuth(app)
        const user = auth.currentUser
        const NewFinded = list.filter((item) => item.author_id.toLowerCase() === user.uid.toLowerCase())

          setThoughts(NewFinded)
          setLoading(false)

        }

        const DeleteComment = async(comment, liked, thoughtName) => {
          const deleteConfirm = true
          if (deleteConfirm) {
            if (liked) {
              const thoughtRef = doc(db, "comments", comment);
      
              // Set the "capital" field of the city 'DC'
              await updateDoc(thoughtRef, {
                  likes: increment(-1)
              });
              const auth = getAuth(app)
              const userdata = auth.currentUser
              const userRef = doc(db, "users", userdata.uid);
              
              // Atomically add a new region to the "regions" array field.
              await updateDoc(userRef, {
                  liked: arrayRemove(comment.id)
              });
    
              const commentRef = doc(db, "comments", comment);
              const docSnap = await getDoc(commentRef)
      
              if (docSnap.data() && !docSnap.data().replies) {
                return
              } else {
                docSnap.data().replies.forEach((reply) => {
                  const replyRef = doc(db, "comments", reply);
                  deleteDoc(replyRef)
                })
              }
              const sparkleRef = doc(db, "thoughts", thoughtName)
              await updateDoc(sparkleRef, {
                comments: arrayRemove(comment)
                })
              await deleteDoc(commentRef)
    
            } else {
              const commentRef = doc(db, "comments", comment);
              const docSnap = await getDoc(commentRef)
      
              if (docSnap.data() && !docSnap.data().replies) {
                return
              } else {
                docSnap.data().replies.forEach((reply) => {
                  const replyRef = doc(db, "comments", reply);
                  deleteDoc(replyRef)
                })
              }
              const sparkleRef = doc(db, "thoughts", thoughtName)
              await updateDoc(sparkleRef, {
                comments: arrayRemove(comment)
                })
              await deleteDoc(commentRef)
            }
          
          } else {
            return
          }
    
    
      }

      const AddThought = async(title, content, topic) => {
        const uniqueId = () => {
          const dateString = Date.now().toString(36);
          const randomness = Math.random().toString(36).substr(2);
          return dateString + randomness;
        };
        const id = uniqueId()
        try {
          const docRef = doc(db, "thoughts", title);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            setAlertType("exists")
            delay(5000).then(() => setAlertType(""))
          } else {
            // docSnap.data() will be undefined in this case
            if ( dailyThoughts != 0) {
              const auth = getAuth(app)
              const user = auth.currentUser
              const docRef = await setDoc(doc(db, "thoughts", title), {
                title: title,
                content: content,
                id: id,
                author_id: user.uid,
                createdAt: serverTimestamp(),
                creationDate: format(new Date(), 'MM/dd/yyyy'),
                views: 0,
                likes: 0,
                comments: [],
                topic: topic
              })
              const userRef = doc(db, "users", user.uid);
  
              await updateDoc(userRef, {
                thoughts: arrayUnion(id)
            });          
            await updateDoc(userRef, {
              dailyThoughts: increment(-1)
            });
            await updateDoc(userRef, {
              lastPostingDate: serverTimestamp()
            })
            if (topic === "general") {
              return
            } else {
              const topicRef = doc(db, "topics", topic);
              await updateDoc(topicRef, {
                sparkles: arrayUnion(id)
              })
            }

            getThoughtNumber(user.uid)
            
              setAlertType("added")
              resetField("title")
              resetField("content")
              delay(5000).then(() => setAlertType(""))
            } else {
              setAlertType("max-thoughts")
              delay(5000).then(() => setAlertType(""))
            }
          }
        } catch (error) {
          setAlertType("error")
          delay(5000).then(() => setAlertType(""))
        }

      }

      const MoveToSearch = async() => {
        navigate("/search")
    }

    const MoveToHome = async() => {
      navigate("/")
  }

    const PostThought = async(data) => {
        AddThought(data.title, data.content, data.topic)
        GetThoughts()
        setOpen(false)
        setTextContent("")
    }

    const openThought = async(thought) => {
      navigate(`/sparkle/${thought.id}`)
    }


    const deleteThought = async(thought) => {
      const deleteAlert = confirm("Are you sure to delete the sparkle?")

      if (deleteAlert) {
        const thoughtRef = doc(db, "thoughts", thought.title)
        const docSnap = await getDoc(thoughtRef)
        const userRef = doc(db, "users", user && user.uid)
        const snap = await getDoc(userRef)
        
        if (snap.data().liked.includes(docSnap.data().id)) {
          if (docSnap.data().comments) {
            docSnap.data().comments.forEach((comment) => {
             DeleteComment(comment, true, thought.title)
            })
          }
          await deleteDoc(thoughtRef)

          setAlertType("success")
          delay(5000).then(() => setAlertType(""))

        }
          if (docSnap.data().comments) {
            docSnap.data().comments.forEach((comment) => {
              DeleteComment(comment, false, thought.title)
            })
          }
          await deleteDoc(thoughtRef)

          setAlertType("success")
          delay(5000).then(() => setAlertType(""))

      }
  }

    useEffect(() => {
      const q = query(collection(db, "thoughts"), orderBy("createdAt", "desc"));

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
          const ThoughtsList = [];
          querySnapshot.forEach((doc) => {
              ThoughtsList.push(doc.data());
          });
          GetUserThoughts(ThoughtsList)
      })

      return () => unsubscribe()
    }, []);
    
    useEffect(() => {
      setTextContent(watch("content"))
    })

    useEffect(() => {
      if (user) {
        getUserDailyThoughts(user.uid)
        getThoughtNumber(user.uid)
        getTopics()
      }
    }, [user])

    const getUserDailyThoughts = async(id) => {

      const docRef = doc(db, "users", id);
      
      if (isChecked) {
        return
      } else {
        setIsChecked(true)
        const docSnap = await getDoc(docRef)
        if (docSnap.data().lastPostingDate === null) {
          setDailyThoughts(3)
        } else {
          if (docSnap.data().dailyThoughts === 3) {
            setDailyThoughts(docSnap.data().dailyThoughts)
          } else {
            if (formatDistanceToNowStrict(docSnap.data().lastPostingDate.toDate()).includes("day") || formatDistanceToNowStrict(docSnap.data().lastPostingDate.toDate()).includes("days")) {
              await updateDoc(docRef, {
                dailyThoughts: 3
              });
              getThoughtNumber(id)
            } else {
              return
            }
          }
        }
      }
    }

    const getThoughtNumber = async(id) => {
      const docRef = doc(db, "users", id);
      const docSnap = await getDoc(docRef)
      if (docSnap.data().dailyThoughts) {
        setDailyThoughts(docSnap.data().dailyThoughts)
    }
  }

  const getTopics = async() => {
    const q = query(collection(db, "topics"));
    const querySnapshot = await getDocs(q).then((docs) => {
      const TopicsList = []
      docs.forEach((doc) => {
        TopicsList.push(doc.data())
        })
        setTopics(TopicsList)
        })

  }

    return (
    <main className="bg-black flex flex-col w-screen text-white gap-2 items-center justify-center h-screen">
                  { !loading ? (<><header className='w-full flex p-2 items-center justify-between mt-2'>
            { thoughts && <h1 className='text-2xl ml-2'>Sparkles: {thoughts.length}</h1>}
            <div className='flex gap-6'>
              { open ? <List className='cursor-pointer hover:stroke-blue-500 transition-colors duration-200'  onClick={() => setOpen(false)}/> : <Pencil className='cursor-pointer hover:stroke-blue-500 transition-colors duration-200' onClick={() => setOpen(true)}/>}
            <Search className='cursor-pointer hover:stroke-blue-500 transition-colors duration-200' onClick={MoveToSearch} />
            <Home className='mr-2 cursor-pointer hover:stroke-blue-500 transition-colors duration-200' onClick={MoveToHome} />
            </div>
          </header>
            <div className='flex flex-col h-screen w-screen text-white items-center justify-center'>
                {
                  open &&
                  <>                  
                  <h1 className=' text-2xl mt-2 md:text-3xl'>Say what do you think.</h1>
                <form className='flex flex-col justify-center items-center gap-3 mt-4 max-sm:w-full w-[500px] p-2' onSubmit={handleSubmit(PostThought)}>
                <label htmlFor="title" className="text-xl w-full">Sparkle Title.</label>
                <input type="text" id="title" placeholder="My thought." {...register("title", {required: true})} className="border-neutral-900 p-1 rounded text-white placeholder:text-neutral-500 caret-neutral-500 text-xl w-full bg-transparent border-2 max-sm:text-md"/>
                { errors.title?.type === "required" ? <h1 className='w-full text-red-500'>This field is required.</h1> : <></>}
                <label htmlFor="content" className="text-xl w-full">Sparkle Content.</label>
                    <textarea name="" id="content" className="border-neutral-900 p-2 rounded text-white placeholder:text-neutral-500 caret-neutral-500 text-xl resize-none w-full h-[200px] [&::-webkit-scrollbar]:w-0 border-2 bg-transparent" placeholder='Hello.' {...register("content", {required: true, maxLength: 200})}></textarea>
                    <div className='flex w-full items-center justify-center gap-2'>
                    {textContent && (<><progress className={textContent && textContent.length > 190 ? 'w-full [&::-webkit-progress-bar]:bg-neutral-900 [&::-webkit-progress-bar]:rounded-full [&::-webkit-progress-value]:bg-red-500 [&::-webkit-progress-value]:rounded-full [&::-webkit-progress-value]:transition-all [&::-webkit-progress-value]:duration-200' : 'w-full [&::-webkit-progress-bar]:bg-neutral-900 [&::-webkit-progress-bar]:rounded-full [&::-webkit-progress-value]:bg-blue-500 [&::-webkit-progress-value]:rounded-full [&::-webkit-progress-value]:transition-all [&::-webkit-progress-value]:duration-200'} value={textContent.length} max={200}></progress>
                      <h1>{textContent ? textContent.length : "0"}/200</h1></>)}
                    </div>
                    { errors.content?.type === "maxLength" ? <h1 className='w-full text-red-500'>You reached the character limit.</h1> : <></>}
                    <label htmlFor="topicsChoose" className="text-xl w-full">Sparkle Topic.</label>
                    { topics && (
                      <select name="topicsChoose" className='w-full border-neutral-900 p-2 rounded-lg *:bg-neutral-950 bg-transparent border-2' {...register("topic")}>
                        <option value="general" selected>General</option>
                        { topics.map((topic) => {
                          return (<option value={topic.name} key={topic.name}>{topic.name}</option>)
                        })}
                      </select>
                    )}
                    { dailyThoughts != 0 &&<button className="text-xl bg-white text-black p-2 rounded-full mt-6 hover:bg-neutral-100 transition-colors duration-200 w-32 border-2 border-neutral-500" type='submit'>Post.</button>}
                    { dailyThoughts != 0 ? <h1 className='mb-4 text-2xl mt-4 md:text-3xl'>{dailyThoughts && dailyThoughts} Sparkles Left for the day.</h1> : <h1 className='mb-4 text-xl mt-4 md:text-2xl text-red-600 text-center w-96'>Daily posting limit reached. Go back tomorrow to be able to post.</h1>}
                </form>
                  </>
                }
                {!open && <h1 className='mt-8 mb-3 text-2xl'>Your Sparkles.</h1>}
                { !open && thoughts.length === 0 && <h1>You don&apos;t have any Sparkles.</h1>}
        { thoughts.length === 0 || open ? (<></>) :  
        <ul className="w-[27rem] md:w-[600px] h-[500px] overflow-auto [&::-webkit-scrollbar]:w-0">
            {thoughts && (
              thoughts.map((thought) => {
                return (
                  <ThoughtItem key={thought.id} open={() => openThought(thought)} title={thought.title} content={thought.content} deleteThought={() => deleteThought(thought)}/>
            )})
          )}
          </ul>

        }
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
            { alertType === "added" && <AlertItem content={"The sparkle was successfully posted."} type={"success"}/>}
            { alertType === "deleted" && <AlertItem content={"The sparkle was successfully deleted."} type={"success"}/>}
            { alertType === "exists" && <AlertItem content={"This sparkle was already said by you or someone."} type={"error"}/>}
            { alertType === "error" && <AlertItem content={"An error occured."} type={"error"}/>}
            { alertType === "max-thoughts" && <AlertItem content={"You reached the daily posting limit."} type={"error"}/>}
  </main>
    )
}

export default ThoughtsPage