/* eslint-disable no-unused-vars */
import { useForm } from "react-hook-form"
import { X, ArrowLeft } from 'lucide-react'
import { useState, useEffect } from "react"
import { collection, onSnapshot, query, where, doc, arrayUnion, updateDoc, deleteField } from "firebase/firestore"
import { db, app } from "../config"
import UserItem from "../components/UserItem"
import { getAuth } from "firebase/auth"
import { useNavigate } from "react-router-dom"
import RecentItem from "../components/RecentItem"

function SearchPage() {
    const { register, handleSubmit, setValue, watch } = useForm()
    const [FindedUsers, setFindedUsers] = useState([])
    const navigate = useNavigate()
    const [recentSearch, setRecentSearch] = useState([])
    const [textContent, setTextContent] = useState("")
    const [error, setError] = useState(false)
    const [loading, setLoading] = useState(true)
    const auth = getAuth()

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

    const getRecents = async() => {
      try {

        const auth = getAuth(app)
        const userdata = auth.currentUser
  
        const q = query(collection(db, "users"), where("id", "==", userdata.uid))
  
        const unsub = await onSnapshot(q, (querySnapshot) => {
          let recents = null
          querySnapshot.forEach((doc) => {
          recents = doc.data().recentSearch
          })
          setRecentSearch(recents)
          setLoading(false)
        })
      } catch {
        setError(true)
      }

    }

      const searchRealTimeUser = async(data) => {
        const auth = getAuth(app)
        const user = auth.currentUser
        
        const q = query(collection(db, "users"), where("id", "!=", user.uid));

        const unsubscribe = await onSnapshot(q, (querySnapshot) => {
            const SearchedUsers = [];
            querySnapshot.forEach((doc) => {
                SearchedUsers.push(doc.data());
            });
            SetRealEffectiveSearch(SearchedUsers, data)
        })
      }

        const SetRealEffectiveSearch = async(list, searchKey) => {
            const NewFinded = list.filter((item) => item.name.toLowerCase().includes(searchKey.toLowerCase()))
           setFindedUsers(NewFinded)
          }

      const openUserPage = async(user) => {
        const auth = getAuth(app)
        const userdata = auth.currentUser
      navigate(`/user/${user.id}`)
      const recentsRef = doc(db, "users", userdata.uid);
      await updateDoc(recentsRef, {
        recentSearch: arrayUnion(user.name)
      });

      }

      const SearchUser = async(data) => {
        if ( watch("search") === "") {
          setFindedUsers([])
        }
        else {
          searchRealTimeUser(data.search)
        }
      }

      const searchFromRecents = async(key) => {
        setValue("search", key)
        searchRealTimeUser(key)
      }

      useEffect(() => {
        getRecents()
      },[])

      const clearAllRecents = async() => {
        const auth = getAuth(app)
        const userdata = auth.currentUser

        const recentsRef = doc(db, 'users', userdata.uid);

        await updateDoc(recentsRef, {
            recentSearch: deleteField()
        });
      }

      useEffect(() => {
        setTextContent(watch("search"))
      })

    return (
    <main className="bg-black flex flex-col h-screen w-screen text-white gap-1 items-center justify-center">
      { !loading ? (<><header className="w-full flex items-center p-4 md:w-[700px]">
      <ArrowLeft size={32} className='cursor-pointer hover:stroke-blue-500 transition-colors duration-200'  onClick={() => navigate("/home")}/>
        <form className="flex flex-col gap-2 w-full ml-2" onChange={handleSubmit(SearchUser)}>
            <div className="flex items-center justify-center gap-4 w-full">
            <input type="text" id="searchData" placeholder="Search Something..." {...register("search")} className="border-neutral-900 border-2 bg-transparent p-1 rounded text-white placeholder:text-neutral-500 caret-neutral-500 text-xl w-full"/>
            { textContent && <X size={32} className='cursor-pointer hover:stroke-blue-500 transition-colors duration-200' onClick={() => setValue("search", "")}/>}
            </div>
        </form>
      </header>
        { recentSearch && recentSearch.length != 0 && textContent === "" ? (
      <div className="w-full flex flex-col p-2 md:w-[700px]">
        <div className="flex items-center justify-between mb-2">
        <h1 className="text-xl">Recent Searchs.</h1>
        <h1 className="text-xl text-blue-500 hover:text-blue-700 transition-colors duration-200 cursor-pointer" onClick={clearAllRecents}>Clear All</h1>
        </div>
        <hr className="border-neutral-500/30"/>
        <ul className="w-full flex items-center mt-4 flex-col overflow-auto [&::-webkit-scrollbar]:w-0 gap-2">
          {recentSearch.map((item) => (
          <RecentItem key={item} content={item} open={() => searchFromRecents(item)}/>
          ))}
        </ul>
      </div>
        ) : (<></>)}
      <div className="w-full h-full flex flex-col items-center">
        {FindedUsers && FindedUsers.length != 0  && <h1 className="text-2xl mt-2 mb-2">Results: {FindedUsers ? FindedUsers.length : "0"}</h1>}
        { FindedUsers.length === 0 ? (<h1 className="text-3xl mt-5">No results.</h1>) :  
         textContent != "" && (
        <ul className="w-full md:w-[700px] h-[620px] overflow-auto p-2 [&::-webkit-scrollbar]:w-0">
            {FindedUsers && (
              FindedUsers.map((user) => {
                return (
                  <UserItem key={user.id} open={() => openUserPage(user)} img={user.photoURL} content={user.name}/>
            )})
          )}
          </ul>
         )

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
  </main>
    )
}

export default SearchPage;