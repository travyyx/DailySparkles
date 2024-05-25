import { CircleCheck, CircleX } from "lucide-react"
import { useEffect, useState } from "react"
// eslint-disable-next-line react/prop-types
export function AlertItem({content, type}) {
    const [visible, setVisible] = useState(false)
    const delay = (milliseconds) => new Promise(resolve => setTimeout(resolve, milliseconds));

    useEffect(() => {
        delay(1000).then(() => setVisible(true))
        delay(4000).then(() => setVisible(false))
    }, [])

    return (
        <div className={visible ? "w-full z-10 bg-black bg-opacity-0 flex flex-col items-center justify-end p-4 sm:p-0 text-white" : "hidden"} >
            <div className={ visible ? " z-20 bg-neutral-900 w-full p-4 rounded flex gap-2 items-center transition-all duration-300 translate-y-0 md:w-auto mb-4" : "translate-y-16 duration-300"}>
                { type === "success" && < CircleCheck className="text-green-500"/>}
                { type === "error" && < CircleX className="text-red-500"/>}
                <h1>{content}</h1>
            </div>
        </div>
    )
}