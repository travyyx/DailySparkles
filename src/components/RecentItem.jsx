import { History, X } from "lucide-react";
import { doc, updateDoc, arrayRemove } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { app, db } from "../config";
/* eslint-disable react/prop-types */
function RecentItem({content, open}) {

    const deleteRecent = async() => {
        const auth = getAuth(app)
        const userdata = auth.currentUser
      const recentsRef = doc(db, "users", userdata.uid);
      await updateDoc(recentsRef, {
        recentSearch: arrayRemove(content)
    });
    }
    return (
        <div className="w-full bg-neutral-900 flex gap-2 p-2 items-center md:rounded-md cursor-pointer rounded-lg justify-between hover:bg-neutral-950 transition-colors duration-200">
            <div className="flex items-center gap-2">
            <History className="text-neutral-500/30"/>
            <h1 className="text-lg truncate hover:underline" onClick={open}>{content}</h1>
            </div>
            <div className="flex gap-2 mr-2">
            <X className="text-neutral-500/30 hover:text-red-500 trasnition-colors duration-200" onClick={deleteRecent}/>
            </div>
        </div>
    )
}

export default RecentItem;