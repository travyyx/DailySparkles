import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getAuth } from 'firebase/auth'
import  { app, db } from '../config'
import { Search, Home,CircleUserRound } from 'lucide-react'
import { where, query, collection, onSnapshot, doc, getDoc, arrayUnion, arrayRemove, updateDoc } from 'firebase/firestore'
import FollowersList from '../components/user/FollowersList'
import FollowingList from '../components/user/FollowingList'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'


function UserThoughts() {
    const [followers, setFollowers] = useState([])
    const [following, setFollowing] = useState([])
    const [ isFollowing, setIsFollowing ] = useState(false)
    const [thoughts, setThoughts] = useState([])
    const [userData, setUserData] = useState({})
    const [ showList, setShowList ] = useState(0)
    const [error, setError] = useState(false)
    const [ bio, setBio] = useState("")
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()
    const path = useParams()


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
            if (item.author_id.toLowerCase() === path.id.toLowerCase()) {
                newFinded.push(item)
            }
        })
        setThoughts(newFinded)
        setLoading(false)
    
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
setError(true)
        }
      }, []);

      const GetUserData = async(list) => {
        const newFinded = []
        list.forEach((item) => {
            if (item.id.toLowerCase() === path.id.toLowerCase()) {
                newFinded.push(item)
            }
        })
        setUserData(newFinded)
    }

    const MoveToHome = async() => {
        navigate("/home")
    }

    const MoveToSearch = async() => {
        navigate("/search")
    }

    const MoveToProfile = async() => {
      navigate("/profile")
  }

  const showFollowers = async() => {
    setShowList(1)
   }

   const showFollowing = async() => {
     setShowList(2)
    }


    const MoveToThoughts = async() => {
      navigate(`/${userData[0].id}/sparkles`)
  }

  const FollowUser = async() => {
    const auth = getAuth(app)
    const user = auth.currentUser
    if (!isFollowing) {
      const docRef = doc(db, "users", user.uid);
      await updateDoc(docRef, {
        following: arrayUnion(path.id)
    });
    const authorRef = doc(db, "users", path.id);
    await updateDoc(authorRef, {
      followers: arrayUnion(user.uid)
  });
    } else {
      const docRef = doc(db, "users", user.uid);
      await updateDoc(docRef, {
        following: arrayRemove(path.id)
    });
    const authorRef = doc(db, "users", path.id);
    await updateDoc(authorRef, {
      followers: arrayRemove(user.uid)
  });
    }
    getFollowState()
  }


  const getUserBio = async() => {

    const q = query(collection(db, "users"), where("id", "==", path.id))
    const unsub = await onSnapshot(q, (querySnapshot) => {
      querySnapshot.forEach((doc) => {
        setBio(doc.data().bio)
        setFollowers(doc.data().followers)
        setFollowing(doc.data().following)
        setThoughts(doc.data().thoughts)
      })
    })
    
    return () => unsub()
  }

  useEffect(() => {
    getUserBio()
  }, [])

  useEffect(() => {
    getFollowState()
  },[])

    const getFollowState = async() => {
      const auth = getAuth(app)
      const user = auth.currentUser
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.data().following.includes(path.id)) {
        setIsFollowing(true)
      } else {
        setIsFollowing(false)
      }

    }
  
    
    return (
        <main className="bg-black flex flex-col h-screen w-screen text-white gap-2 items-center justify-center">
          { !loading ? (<><header className='w-full flex p-2 items-center justify-between mt-2'>
            <h1 className='text-2xl ml-4 truncate md:text-3xl'>{userData[0] && userData[0].name}&apos;s Home.</h1>
            <div className='flex gap-2'>
            <CircleUserRound className='mr-2 cursor-pointer hover:stroke-blue-500 transition-colors duration-200 md:size-7' onClick={MoveToProfile}/>
            <Search className='mr-2 cursor-pointer hover:stroke-blue-500 transition-colors duration-200 md:size-7' onClick={MoveToSearch}/>
            <Home className='mr-2 cursor-pointer hover:stroke-blue-500 transition-colors duration-200 md:size-7' onClick={MoveToHome} />
            </div>
          </header>
            <div className='flex flex-col h-screen w-screen text-white gap-2 items-center justify-center'>
                <div className='flex flex-col items-center justify-center gap-3'>
        
          <img src={userData[0] ? userData[0].photoURL : ""} alt="Profile picture." className='rounded-full md:size-24' />
        <h1 className="text-3xl font-semibold md:text-4xl">{userData[0] ? userData[0].name : "Guest"}</h1>
                </div>
                <Markdown className='text-neutral-400 text-clip text-center w-64 text-2xl' remarkPlugins={[remarkGfm]} components={{
              a(props) {
                const {node, ...rest} = props
                return <a className="text-blue-500 " href={rest.href} target="_blank">{rest.href}</a>
              }
            }}>{bio ? bio : "No bio yet."}</Markdown>

        <div className='flex gap-8 w-full items-center justify-center mt-4 text-neutral-500 md:gap-10'>
        { thoughts && <h1 className='text-xl mt-3 md:text-2xl cursor-pointer hover:underline' onClick={MoveToThoughts}>{thoughts.length} Sparkles</h1>}
        { followers && <h1 className='text-xl mt-3 md:text-2xl hover:underline cursor-pointer' onClick={showFollowers}>{followers.length} { followers.length === 1 ? "Follower" : "Followers"}</h1>}
        { following && <h1 className='text-xl mt-3 md:text-2xl hover:underline cursor-pointer' onClick={showFollowing}>{following.length} Following</h1>}
        </div>
            </div>
        <footer className='w-screen flex items-center justify-center mb-3 gap-2'>
        { isFollowing ? (<button className="text-xl text-white p-3 rounded-full mt-6 hover:bg-red-700 transition-colors duration-200 w-48" onClick={FollowUser}>Unfollow.</button>) : (<button className="text-xl bg-blue-500 text-white p-3 rounded-full mt-6 hover:bg-blue-700 transition-colors duration-200 w-48" onClick={FollowUser}>Follow.</button>)
}
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
        { showList === 1 && <FollowersList onClose={() => setShowList(0)} id={path.id}/>}
        { showList === 2 && <FollowingList onClose={() => setShowList(0)} id={path.id}/>}
      </main>
    )
}

export default UserThoughts