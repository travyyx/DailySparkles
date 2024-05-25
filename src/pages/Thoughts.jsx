/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import { Search, Home, Pencil, List } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAuth } from 'firebase/auth'
import  { app, db } from '../config'
import { query, collection, onSnapshot, setDoc, doc, serverTimestamp, getDoc, deleteDoc, orderBy } from 'firebase/firestore'
import { useForm } from "react-hook-form"
import ThoughtItem from '../components/ThoughtItem'
import moment from 'moment'
import { AlertItem } from '../components/PostingModal'


function ThoughtsPage() {

    const navigate = useNavigate()
    const { register, handleSubmit, resetField, formState: {errors}, watch } = useForm()
    const auth = getAuth()
    const [thoughts, setThoughts] = useState([])
    const [open, setOpen] = useState(true)
    const [textContent, setTextContent] = useState("")
    const [alertType, setAlertType] = useState("")
    const delay = (milliseconds) => new Promise(resolve => setTimeout(resolve, milliseconds));


    useEffect(() => {
        const auth = getAuth(app)
        const unsubscribe = auth.onAuthStateChanged((user) => {
          if (user) {
            return
          }
          else {
            navigate("/")
          }
        })
    
        return () => unsubscribe()
      }, [auth, navigate]);

      const GetThoughts = async() => {
        const q = query(collection(db, "thoughts"));

        const unsubscribe = await onSnapshot(q, (querySnapshot) => {
            const ThoughtsList = [];
            querySnapshot.forEach((doc) => {
                ThoughtsList.push(doc.data());
            });
            GetUserThoughts(ThoughtsList)
        })
      }

      const GetUserThoughts = async(list) => {
        const auth = getAuth(app)
        const user = auth.currentUser
        const NewFinded = list.filter((item) => item.author.toLowerCase() === user.uid.toLowerCase())

          setThoughts(NewFinded)

        }

      const AddThought = async(title, content) => {
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
            const auth = getAuth(app)
            const user = auth.currentUser
            const docRef = await setDoc(doc(db, "thoughts", title), {
              title: title,
              content: content,
              id: id,
              author: user.uid,
              createdAt: serverTimestamp(),
              creationDate: moment().format("L")
            })
            setAlertType("added")
            resetField("title")
            resetField("content")
            delay(5000).then(() => setAlertType(""))
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
        AddThought(data.title, data.content)
        GetThoughts()
        setOpen(false)
        setTextContent("")
    }

    const openThought = async(thought) => {
      navigate(`/thought/${thought.id}`)
    }

    const deleteThought = async(thought) => {
    const thoughtRef = doc(db, "thoughts", thought.title)
    await deleteDoc(thoughtRef)
    setAlertType("deleted")
    delay(5000).then(() => setAlertType(""))
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

    return (
    <main className="bg-black flex flex-col h-screen w-screen text-white gap-2 items-center justify-center">
                  <header className='w-full flex p-2 items-center justify-between mt-2'>
            { thoughts && <h1 className='text-2xl ml-2'>Thoughts: {thoughts.length}</h1>}
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
                  <h1 className='mb-4 text-xl mt-4'>Say what do you think.</h1>
                <form className='flex flex-col justify-center items-center gap-3 mt-4' onSubmit={handleSubmit(PostThought)}>
                <label htmlFor="title" className="text-xl w-full">Thought Title.</label>
                <input type="text" id="title" placeholder="My thought." {...register("title", {required: true})} className="bg-neutral-900 p-1 rounded text-white placeholder:text-neutral-500 caret-neutral-500 text-xl w-full"/>
                { errors.title?.type === "required" ? <h1 className='w-full text-red-500'>This field is required.</h1> : <></>}
                <label htmlFor="content" className="text-xl w-full">Thought Content.</label>
                    <textarea name="" id="content" className="bg-neutral-900 p-2 rounded text-white placeholder:text-neutral-500 caret-neutral-500 text-xl resize-none w-[400px] h-[150px]" placeholder='Hello.' {...register("content", {required: true, maxLength: 200})}></textarea>
                    <div className='flex w-full items-center justify-center gap-2'>
                    {textContent && (<><progress className={textContent && textContent.length > 190 ? 'w-full [&::-webkit-progress-bar]:bg-neutral-900 [&::-webkit-progress-bar]:rounded-full [&::-webkit-progress-value]:bg-red-500 [&::-webkit-progress-value]:rounded-full [&::-webkit-progress-value]:transition-all [&::-webkit-progress-value]:duration-200' : 'w-full [&::-webkit-progress-bar]:bg-neutral-900 [&::-webkit-progress-bar]:rounded-full [&::-webkit-progress-value]:bg-blue-500 [&::-webkit-progress-value]:rounded-full [&::-webkit-progress-value]:transition-all [&::-webkit-progress-value]:duration-200'} value={textContent.length} max={200}></progress>
                      <h1>{textContent ? textContent.length : "0"}/200</h1></>)}
                    </div>
                    { errors.content?.type === "maxLength" ? <h1 className='w-full text-red-500'>You reached the character limit.</h1> : <></>}
                    <button className="text-xl bg-white text-black p-2 rounded-full mt-6 hover:bg-neutral-100 transition-colors duration-200 w-32" type='submit'>Post.</button>
                </form>
                  </>
                }
                {!open && <h1 className='mt-8 mb-3 text-2xl'>Your Thoughts.</h1>}
                { !open && thoughts.length === 0 && <h1>You don&apos;t have any thoughts.</h1>}
        { thoughts.length === 0 || open ? (<></>) :  
        <ul className="w-[30rem] md:w-[600px] h-[500px] overflow-auto">
            {thoughts && (
              thoughts.map((thought) => {
                return (
                  <ThoughtItem key={thought.id} open={() => openThought(thought)} title={thought.title} content={thought.content} deleteThought={() => deleteThought(thought)}/>
            )})
          )}
          </ul>

        }
            </div>
            { alertType === "added" && <AlertItem content={"The thought was successfully posted."} type={"success"}/>}
            { alertType === "deleted" && <AlertItem content={"The thought was successfully deleted."} type={"success"}/>}
            { alertType === "exists" && <AlertItem content={"This thought was already said by you or someone."} type={"error"}/>}
            { alertType === "error" && <AlertItem content={"An error occured."} type={"error"}/>}
  </main>
    )
}

export default ThoughtsPage