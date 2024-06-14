import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAuth, signOut } from 'firebase/auth'
import  { app, db } from '../config'
import { Search, List,BadgeCheck, Pencil} from 'lucide-react'
import { query, collection, onSnapshot, where} from 'firebase/firestore'
import { EditModal } from '../components/EditProfileModal'
import FollowersList from '../components/FollowersList'
import FollowingList from '../components/FollowingList'

function UserPage() {
    const [user, setUser] = useState(null)
    const [thoughts, setThoughts] = useState([])
    const [followers, setFollowers] = useState([])
    const [following, setFollowing] = useState([])
    const [ edit, setEdit ] = useState(false)
    const [ showList, setShowList ] = useState(0)
    const [ verified, setVerified ] = useState(false)
    const [ bio, setBio] = useState("")
    const [error, setError] = useState(false)
    const [loading, setLoading] = useState(true)
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
            setLoading(false)
        })
  
        return () => unsubscribe()
      }, []);

      function GetUserThoughts(list) {
        const auth = getAuth(app)
        const user = auth.currentUser
        const NewFinded = list.filter((item) => item.author_id.toLowerCase() === user.uid.toLowerCase())

          setThoughts(NewFinded)

        }

        const getUserBio = async() => {
          try {

            const auth = getAuth(app)
            const userdata = auth.currentUser
      
            const q = query(collection(db, "users"), where("id", "==", userdata.uid))
      
            const unsub = await onSnapshot(q, (querySnapshot) => {
              querySnapshot.forEach((doc) => {
                setBio(doc.data().bio)
                setVerified(doc.data().verified)
                setFollowers(doc.data().followers)
                setFollowing(doc.data().following)
              })
            })
            
            return () => unsub()
          } catch {
setError(true)
          }
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

    function NavigateToSharePage() {
        navigate("/sparkles")
    }

    const NavigateToSearch = async() => {
        navigate("/search")
    }
    const showEdit = async() => {
      setEdit(true)
    }

    const showFollowers = async() => {
     setShowList(1)
    }

    const showFollowing = async() => {
      setShowList(2)
     }

    useEffect(() => {
      getUserBio()
    }, [])

    return (
        <main className="bg-black flex flex-col h-screen w-screen text-white gap-2 items-center justify-center">
          {!loading ? (<><header className='w-full flex p-2 items-center justify-between mt-2'>
            <h1 className='text-2xl ml-4 md:text-3xl cursor-pointer hover:underline' onClick={() => navigate("/home")}>Home</h1>
            <div className='flex gap-4'>
            <List className='cursor-pointer hover:stroke-blue-500 transition-colors duration-200 md:size-7'  onClick={NavigateToSharePage}/> 
            <Search className='mr-2 cursor-pointer hover:stroke-blue-500 transition-colors duration-200 md:size-7' onClick={NavigateToSearch} title="Search"/>
            </div>
          </header>
            <div className='flex flex-col h-screen w-screen text-white gap-2 items-center justify-center'>
                <div className='flex flex-col items-center justify-center gap-3'>
                  <div className='relative'>
            <img src={user ? user.photoURL : ""} alt="Profile picture." className='rounded-full cursor-pointer md:size-24 hover:-translate-y-1 hover:scale-105 transition-all duration-200 peer' onClick={showEdit} title='Edit profile.'/>
                    <div className='rounded-full bg-neutral-800 p-2 w-8 absolute -bottom-1 right-1 peer-hover:hidden'>
                    <Pencil size={18} className='peer-hover:hidden'/>
                    </div>
                  </div>
            <div className='w-full flex gap-2 items-center justify-center'>
        <h1 className="text-3xl font-semibold md:text-4xl">Welcome {user ? user.displayName : "Guest"}</h1>
        { verified && <BadgeCheck size={28}/>}
            </div>
        <h1 className='text-neutral-400 text-clip text-center w-64 text-xl'>{bio ? bio : "No bio yet. Click on the image to add one."}</h1>
                </div>
        <div className='flex gap-8 w-full items-center justify-center mt-4 text-neutral-500 md:gap-10'>
        { thoughts && <h1 className='text-xl mt-3 md:text-2xl cursor-pointer hover:underline' onClick={() => navigate("/sparkles")}>{thoughts.length} {thoughts.length === 1 ? "Sparkle" : "Sparkles"}</h1>}
        { followers && <h1 className='text-xl mt-3 md:text-2xl hover:underline cursor-pointer' onClick={showFollowers}>{followers.length} { followers.length === 1 ? "Follower" : "Followers"}</h1>}
        { following && <h1 className='text-xl mt-3 md:text-2xl hover:underline cursor-pointer' onClick={showFollowing}>{following.length} Following</h1>}
        </div>
            </div>
        <footer className='w-screen flex items-center justify-center mb-3 gap-2'>
        <button className="text-xl text-white p-3 rounded-full mt-6 hover:bg-red-700  transition-colors duration-200 w-32 md-text-3xl" title='Logout.' onClick={Logout}>Logout</button>
        </footer></>) : (
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
        { edit && <EditModal onClose={() => setEdit(false)}/>}
        { showList === 1 && <FollowersList onClose={() => setShowList(0)}/>}
        { showList === 2 && <FollowingList onClose={() => setShowList(0)}/>}
      </main>
    )
}

export default UserPage