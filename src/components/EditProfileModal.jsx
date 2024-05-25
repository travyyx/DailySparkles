/* eslint-disable no-unused-vars */
import { useForm, useWatch } from 'react-hook-form';
import { X } from 'lucide-react'
import { useState, useEffect } from 'react';
import { app, db, storage } from '../config';
import { getAuth, updateProfile } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { ImageRestriction, FixedCropper } from 'react-advanced-cropper';
import { onSnapshot, query, where, collection, doc, updateDoc } from 'firebase/firestore';
import { AlertItem } from '../components/PostingModal'
import 'react-advanced-cropper/dist/style.css'

// Import the editor styles
// eslint-disable-next-line react/prop-types
export function EditModal({onClose}) {
    const { register, handleSubmit, formState: {errors}, control, setValue, watch} = useForm();
    const [user, setUser] = useState(null)
    const [ editing, setEditing] = useState(false)
    const [downloadUrl, setDownloadUrl] = useState("")
    const [textContent, setTextContent] = useState("")
    const [name, setName] = useState(null)
    const auth = getAuth()

    const onChange = (cropper) => {
        window.sessionStorage.setItem("data", cropper.getCanvas({width: 96, height: 96})?.toDataURL())
    };
    
    const handleSave = async() => {
        URL.revokeObjectURL(fileobj[0])
        setEditing(false)
        const base64 = await fetch(window.sessionStorage.getItem("data"));
        const blob = await base64.blob();
        await upload(blob)

    }

  

    const onSubmit = async(data) => {
        const auth = getAuth(app)
        const user = auth.currentUser
        const userRef = doc(db, "users", user.uid);
        console.log(downloadUrl)
        await updateDoc(userRef, {
        bio: data.content,
        name: data.name,
        photoURL: downloadUrl
        });

        updateProfile(auth.currentUser, {
        displayName: data.name, photoURL: downloadUrl ? downloadUrl : user.photoURL

        }).then(() => {
          onClose()

        }).catch((error) => {
          alert("An error occured.")
        });

    }

const upload = async(file) => {
    const auth = getAuth(app)
    const user = auth.currentUser
    const storageRef = ref(storage, `profiles/${user.displayName}`);
    uploadBytes(storageRef, file).then((snapshot) => {
        getDownloadURL(storageRef)
  .then((url) => {
    // Insert url into an <img> tag to "download"
    console.log(url)
    setDownloadUrl(url)
    window.sessionStorage.clear()
  })

      });

  }

  const onFileClick = async() => {
    const fileElem = document.getElementById("username")
    fileElem.click()
  }

      useEffect(() => {
        const auth = getAuth(app)
        const unsubscribe = auth.onAuthStateChanged((user) => {
          if (user) {
            setUser(user)
          }
          else {
            return
          }
        })
    
        return () => unsubscribe()
      }, [auth]);

      const fileobj = useWatch({control, name: "filepath"})
      useEffect(() => {
          if (fileobj) {
            if (fileobj[0].size > 250000) {
                alert("The chosen image is too big. Please select one under 500x500.")
            }
            else {

                setEditing(true)
            }
          }
          else {
            setEditing(false)
          }
      }, [fileobj])

      useEffect(() => {
        const auth = getAuth(app)
        const user = auth.currentUser
        const q = query(collection(db, "users"), where("id", "==", user.uid));
  
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            querySnapshot.forEach((doc) => {
                setValue("content", doc.data().bio)
            });
        })
        setValue("name", user.displayName)
  
        return () => unsubscribe()
      }, [setValue]);

      useEffect(() => {
        setTextContent(watch("content"))
      })



    return (
        <div className="fixed inset-0 bg-black backdrop-blur-sm bg-opacity-30 flex flex-col items-center justify-center p-4 sm:p-0 text-white">
            { !editing ? <div className="bg-neutral-900 m-4 p-4 rounded w-full md:w-[400px]">
            <div className='flex items-center justify-between mb-5'>
                <h1 className="text-2xl font-bold">Edit Profile.</h1>
                <X onClick={onClose} className=' cursor-pointer'/>
            
            </div>
            <div>
                <form action="submit" className='gap-1 flex flex-col' onSubmit={handleSubmit(onSubmit)}>
                <label htmlFor="name" className="w-full pb-1 text-lg">Display Name</label>
                <input className="bg-neutral-950 rounded border-neutral-900 border outline-none caret-neutral-700 p-0.5 placeholder:text-neutral-300/30 px-2 w-full text-lg"
                type="text" 
                id="name"
                placeholder="Example User"
                {...register("name", {required: true})}/>
                {errors.name && <span className="flex items-start text-red-500 w-full mt-2">Invalid Display name.</span>}
                <label htmlFor="name" className="w-full pb-1 text-lg mt-1">Description</label>
                <textarea name="" id="content" className=" w-full bg-neutral-950 p-2 rounded text-white placeholder:text-neutral-500 caret-neutral-500 text-xl resize-none h-[150px]" placeholder='Hello.' {...register("content", {required: true, maxLength: 200})}></textarea>
                <div className='flex items-center gap-3 mt-2'>
                {textContent && (<><progress className={textContent && textContent.length > 190 ? 'w-full [&::-webkit-progress-bar]:bg-neutral-950 [&::-webkit-progress-bar]:rounded-full [&::-webkit-progress-value]:bg-red-500 [&::-webkit-progress-value]:rounded-full [&::-webkit-progress-value]:transition-all [&::-webkit-progress-value]:duration-200' : 'w-full [&::-webkit-progress-bar]:bg-neutral-950 [&::-webkit-progress-bar]:rounded-full [&::-webkit-progress-value]:bg-blue-500 [&::-webkit-progress-value]:rounded-full [&::-webkit-progress-value]:transition-all [&::-webkit-progress-value]:duration-200'} value={textContent.length} max={200}></progress>
                      <h1>{textContent ? textContent.length : "0"}/200</h1></>)}
                </div>
                <label htmlFor="username" className="w-full pb-1 text-lg mt-1 text-center">Profile Picture</label>
                <div className='flex flex-col w-full items-center'>
                <img src={user && !downloadUrl ? user.photoURL : downloadUrl} alt="profile picture" className='rounded-full mb-3 cursor-pointer' onClick={onFileClick}/>

                <input
                type="file" 
                id="username"
                accept='image/*'
                className='hidden'
                {...register("filepath")}/>
                </div>
                <button type="submit" className="mt-2 bg-green-700 text-white text-md p-1 rounded hover:bg-green-900 transition-colors duration-200 focus:ring-green-600/50 focus:ring-1 outline-none w-full">Save Changes.</button>
                </form>
            </div>
            </div> :<div className='w-full flex flex-col items-center justify-center'>
            <FixedCropper
            id="cropper"
            src={URL.createObjectURL(fileobj[0])}
            onChange={onChange}
            stencilSize={{
                width: 256,
                height: 256
            }}
            stencilProps={{
                handlers: false,
                lines: false,
                movable: false,
                resizable: false
            }}
            imageRestriction={ImageRestriction.stencil}
            className={'cropper size-96'}
        />
                    <button className="text-xl text-white p-2 bg-sky-500 rounded-full mt-4 hover:bg-sky-700  transition-colors duration-200 w-32" onClick={handleSave}>Save</button>
                    <button className="text-xl text-white p-2 bg-red-500 rounded-full mt-4 hover:bg-red-700  transition-colors duration-200 w-32" onClick={() => onClose()}>Leave.</button>
                    
                    </div>
                    }
        </div>   
                        
    )
}