import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAuth, signOut } from 'firebase/auth'
import  { app, db } from '../config'
import { Search, List } from 'lucide-react'
import { query, collection, onSnapshot, where } from 'firebase/firestore'
import { EditModal } from '../components/EditProfileModal'


function HomePage() {
    const [user, setUser] = useState(null)
    const [thoughts, setThoughts] = useState([])
    const [ edit, setEdit ] = useState(false)
    const [ bio, setBio] = useState("")
    const navigate = useNavigate()
    const auth = getAuth()

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
        const auth = getAuth(app)
        const user = auth.currentUser
        const NewFinded = list.filter((item) => item.author.toLowerCase() === user.uid.toLowerCase())

          setThoughts(NewFinded)

        }

        const getUserBio = async() => {

          const auth = getAuth(app)
          const userdata = auth.currentUser
    
          const q = query(collection(db, "users"), where("id", "==", userdata.uid))
    
          const unsub = await onSnapshot(q, (querySnapshot) => {
            querySnapshot.forEach((doc) => {
              setBio(doc.data().bio)
            })
          })
          
          return () => unsub()
        }

    const Logout = async() => {
        try {
          const auth = getAuth(app)
          await signOut(auth)
          navigate("/")
        } catch (error) {
          alert("An error occured.")
        }
    }

    const MoveToShare = async() => {
        navigate("/thoughts")
    }

    const MoveToSearch = async() => {
        navigate("/search")
    }
    const showEdit = async() => {
      setEdit(true)
    }

    useEffect(() => {
      getUserBio()
    })
    
    return (
        <main className="bg-black flex flex-col h-screen w-screen text-white gap-2 items-center justify-center">
          <header className='w-full flex p-2 items-center justify-between mt-2'>
            <h1 className='text-2xl ml-4 md:text-3xl'>Home</h1>
            <div className='flex gap-4'>
            <List className='cursor-pointer hover:stroke-blue-500 transition-colors duration-200 md:size-7'  onClick={MoveToShare}/> 
            <Search className='mr-2 cursor-pointer hover:stroke-blue-500 transition-colors duration-200 md:size-7' onClick={MoveToSearch} title="Search"/>
            </div>
          </header>
            <div className='flex flex-col h-screen w-screen text-white gap-2 items-center justify-center'>
                <div className='flex flex-col items-center justify-center gap-3'>
            <img src={user ? user.photoURL : ""} alt="Profile picture." className='rounded-full cursor-pointer' onClick={showEdit} title='Edit profile.'/>
        <h1 className="text-3xl font-semibold md:text-4xl">Welcome {user ? user.displayName : "Guest"}</h1>
        <h1 className='text-neutral-400 text-clip text-center w-64 md:text-lg'>{bio ? bio : "No bio yet. Click on the image to add one."}</h1>
                </div>

        { thoughts && <h1 className='text-xl mt-3 md:text-2xl'>Thoughts: {thoughts.length}</h1>}
            </div>
        <footer className='w-screen flex items-center justify-center mb-3 gap-2'>
        <button className="text-xl text-white p-3 rounded-full mt-6 hover:bg-red-700  transition-colors duration-200 w-32 md-text-2xl" title='Logout.' onClick={Logout}>Logout</button>
        </footer>
        { edit && <EditModal onClose={() => setEdit(false)}/>}
      </main>
    )
}

export default HomePage