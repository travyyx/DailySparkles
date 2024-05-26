/* eslint-disable no-unused-vars */
import { useForm } from "react-hook-form"
import { Search, ArrowLeft } from 'lucide-react'
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

      const auth = getAuth(app)
      const userdata = auth.currentUser

      const q = query(collection(db, "users"), where("id", "==", userdata.uid))

      const unsub = await onSnapshot(q, (querySnapshot) => {
        let recents = null
        querySnapshot.forEach((doc) => {
        recents = doc.data().recentSearch
        })
        setRecentSearch(recents)
      })

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
      navigate(`/${user.id}`)
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

    return (
    <main className="bg-black flex flex-col h-screen w-screen text-white gap-2 items-center justify-center">
      <header className="w-full flex items-center p-4">
      <ArrowLeft size={32} className='cursor-pointer hover:stroke-blue-500 transition-colors duration-200'  onClick={() => navigate("/home")}/>
        <form className="flex flex-col gap-2 w-full ml-2" onChange={handleSubmit(SearchUser)}>
            <div className="flex items-center justify-center gap-4 w-full">
            <input type="text" id="searchData" placeholder="Search Something..." {...register("search")} className="bg-neutral-900 p-1 rounded text-white placeholder:text-neutral-500 caret-neutral-500 text-xl w-full"/>
            </div>
        </form>
      </header>
        { recentSearch && recentSearch.length != 0 ? (
      <div className="w-full flex flex-col p-4 md:w-[600px]">
        <div className="flex items-center justify-between mb-2">
        <h1 className="text-xl">Recent Searchs.</h1>
        <h1 className="text-xl text-blue-500 hover:text-blue-700 transition-colors duration-200 cursor-pointer" onClick={clearAllRecents}>Clear All</h1>
        </div>
        <hr className="border-neutral-500/30"/>
        <ul className="w-full flex items-center mt-4 flex-col h-96 overflow-auto [&::-webkit-scrollbar]:w-0">
          {recentSearch.map((item) => (
          <RecentItem key={item} content={item} open={() => searchFromRecents(item)}/>
          ))}
        </ul>
      </div>
        ) : (<></>)}
      <div className="w-full h-full flex flex-col items-center">
        {FindedUsers && FindedUsers.length != 0  && <h1 className="text-2xl mt-5">Results: {FindedUsers ? FindedUsers.length : "0"}</h1>}
        { FindedUsers.length === 0 ? (<h1 className="text-3xl mt-5">No results.</h1>) :  
        <ul className="w-full md:w-[600px] h-[600px] overflow-auto p-2 [&::-webkit-scrollbar]:w-0">
            {FindedUsers && (
              FindedUsers.map((user) => {
                return (
                  <UserItem key={user.id} open={() => openUserPage(user)} img={user.photoURL} content={user.name}/>
            )})
          )}
          </ul>

        }
      </div>
  </main>
    )
}

export default SearchPage;