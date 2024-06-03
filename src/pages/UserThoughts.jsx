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
  const [error, setError] = useState(false)
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
        if (item.author_id.toLowerCase() === id.id.toLowerCase()) {
            newFinded.push(item)
        }
    })
    setThoughts(newFinded)

  }
  useEffect(() => {
    try {

      const q = query(collection(db, "users"));
  
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
          const ThoughtsList = [];
          querySnapshot.forEach((doc) => {
              ThoughtsList.push(doc.data());
          });
          GetUserData(ThoughtsList)
      })
  
      return () => unsubscribe()
    } catch {
      alert("An error occured. Please try again.")
      window.location.reload()
    }
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
        <ul className="w-[30rem] md:w-[600px] h-[500px] overflow-auto [&::-webkit-scrollbar]:w-0">
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
          ) : (
<>
            <div role="status" className='flex w-full items-center justify-center h-full flex-col gap-7'>
          { !error && (<svg aria-hidden="true" className="w-16 h-16 text-gray-200 animate-spin dark:text-neutral-900 fill-white" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
              <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
          </svg>)}
          {error && (<h1 className="text-2xl w-96 text-center md:text-3xl md:w-[30rem]">An error occured. Please wait a few and try again.</h1>)}

          </div>
          </>)}
      </main>
    )
}

export default UserThoughtPage