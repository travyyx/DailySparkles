import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getAuth, signOut } from 'firebase/auth'
import  { app, db } from '../config'
import { Search, Home } from 'lucide-react'
import { where, query, collection, onSnapshot } from 'firebase/firestore'


function UserPage() {
    const [user, setUser] = useState(null)
    const [thoughts, setThoughts] = useState([])
    const [userData, setUserData] = useState({})
    const [ bio, setBio] = useState("")
    const navigate = useNavigate()
    const auth = getAuth()
    const path = useParams()

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

      const GetUserThoughts = async(list) => {
        const newFinded = []
        list.forEach((item) => {
            if (item.author.toLowerCase() === path.id.toLowerCase()) {
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
            if (item.id.toLowerCase() === path.id.toLowerCase()) {
                newFinded.push(item)
            }
        })
        setUserData(newFinded)
        //const NewFinded = list.filter((item) => item.author.toLowerCase() === user.uid.toLowerCase())

          //setThoughts(NewFinded)
    }

    const MoveToHome = async() => {
        navigate("/home")
    }

    const MoveToSearch = async() => {
        navigate("/search")
    }

    const MoveToThoughts = async() => {
      navigate(`/${userData[0].id}/thoughts`)
  }


  const getUserBio = async() => {


    const q = query(collection(db, "users"), where("id", "==", path.id))

    const unsub = await onSnapshot(q, (querySnapshot) => {
      querySnapshot.forEach((doc) => {
        setBio(doc.data().bio)
      })
    })
    
    return () => unsub()
  }

  useEffect(() => {
    getUserBio()
  })
  
    
    return (
        <main className="bg-black flex flex-col h-screen w-screen text-white gap-2 items-center justify-center">
          <header className='w-full flex p-2 items-center justify-between mt-2'>
            <h1 className='text-2xl ml-4 truncate'>{userData[0] && userData[0].name}&apos;s Home.</h1>
            <div className='flex gap-2'>
            <Search className='mr-2 cursor-pointer hover:stroke-blue-500 transition-colors duration-200' onClick={MoveToSearch}/>
            <Home className='mr-2 cursor-pointer hover:stroke-blue-500 transition-colors duration-200' onClick={MoveToHome} />
            </div>
          </header>
            <div className='flex flex-col h-screen w-screen text-white gap-2 items-center justify-center'>
                <div className='flex flex-col items-center justify-center gap-3'>
            <img src={userData[0] ? userData[0].photoURL : ""} alt="Profile picture." className='rounded-full' />
        <h1 className="text-3xl font-semibold">{userData[0] ? userData[0].name : "Guest"}</h1>
        <h1 className='text-neutral-400 text-clip text-center w-64'>{bio ? bio : "No bio yet."}</h1>
                </div>

        { thoughts && <h1 className='text-xl mt-1'>Thoughts: {thoughts.length}</h1>}
            </div>
        <footer className='w-screen flex items-center justify-center mb-3 gap-2'>
        <button className="text-xl bg-blue-500 text-white p-3 rounded-full mt-6 hover:bg-blue-700 transition-colors duration-200 w-48" onClick={MoveToThoughts}>Thoughts.</button>
        </footer>

      </main>
    )
}

export default UserPage