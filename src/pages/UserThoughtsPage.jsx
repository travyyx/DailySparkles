import { useParams, useNavigate } from 'react-router-dom'
import { deleteDoc, doc, query, collection, onSnapshot } from 'firebase/firestore'
import  { app, db } from '../config'
import { useState, useEffect } from 'react'
import { getAuth, signOut } from 'firebase/auth'
import { Home } from 'lucide-react'
import UserThoughtItem from '../components/UserThoughtItem'

function UserThoughtPage() {
  const id = useParams()
  const auth = getAuth()
  const navigate = useNavigate()
  const [thoughts, setThoughts] = useState([])
  const [user, setUser] = useState({})
  const [isLoading, setIsLoading] = useState(true)

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

  useEffect(() => {
    const q = query(collection(db, "thoughts"));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const ThoughtsList = [];
        querySnapshot.forEach((doc) => {
            ThoughtsList.push(doc.data());
        });
        setThoughts(ThoughtsList)
    })

    return () => unsubscribe()
  }, []);

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
  
  const GetUserThoughts = async(list) => {
    const newFinded = []
    list.forEach((item) => {
        if (item.author.toLowerCase() === id.id.toLowerCase()) {
            newFinded.push(item)
        }
    })
    setThoughts(newFinded)

  }
  useEffect(() => {
    const q = query(collection(db, "users"));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const ThoughtsList = [];
        querySnapshot.forEach((doc) => {
            ThoughtsList.push(doc.data());
        });
        GetUserData(ThoughtsList)
    })

    return () => unsubscribe()
  }, []);

  const GetUserData = async(list) => {
    const newFinded = []
    list.forEach((item) => {
        if (item.id.toLowerCase() === id.id.toLowerCase()) {
            newFinded.push(item)
        }
    })
    setUser(newFinded)
    setIsLoading(false)
    //const NewFinded = list.filter((item) => item.author.toLowerCase() === user.uid.toLowerCase())

      //setThoughts(NewFinded)
}

const openThought = async(thought) => {
  navigate(`/thought/${thought.id}`)
}

const MoveToHome = async() => {
  navigate(`/${id.id}`)
}
    return (
        <main className="bg-black flex flex-col h-screen w-screen text-white gap-2 items-center">
          { !isLoading ? (
            <>
            <header className='w-full flex p-2 items-center justify-between mt-2'>
            <h1 className='text-xl ml-2 truncate'>{user[0] && user[0].name}&apos;s Thoughts.</h1>
            <Home className='mr-2 cursor-pointer hover:stroke-blue-500 transition-colors duration-200' onClick={MoveToHome}/>
          </header>
          <div className='flex flex-col gap-2 mt-5 items-center'>
            <h1 className='text-2xl'>Thoughts: {thoughts ? thoughts.length : "0"}</h1>
            { thoughts.length === 0  ? (<></>) :  
        <ul className="w-[30rem] md:w-[600px] h-[500px] overflow-auto">
            {thoughts && (
              thoughts.map((thought) => {
                return (
                  <UserThoughtItem key={thought.id} open={() => openThought(thought)} title={thought.title} content={thought.content}/>
                )})
              )}
          </ul>

        }
          </div>
        </>
          ) : (<div className='w-full flex items-center justify-center h-full'>
            <h1 className='text-3xl'>Loading...</h1>
          </div>)}
      </main>
    )
}

export default UserThoughtPage