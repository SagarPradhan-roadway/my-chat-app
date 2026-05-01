import { createContext, useContext, useEffect, useRef, useState } from "react";
import { AuthContext } from "./AuthContext";
import toast from "react-hot-toast";
import Peer from "simple-peer";



export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {

    const [messages, setMessages] = useState([]);
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [unseenMessages, setUnseenMessages] = useState({});

    // +++++++++++++++++++++++++++++
    const [call, setCall] = useState({});
    const [callAccepted, setCallAccepted] = useState(false);
    const [callEnded, setCallEnded] = useState(false);
    const [stream, setStream] = useState(null);
    const [callTime, setCallTime] = useState(0);
    // ++++++++++++++++++++++++++++++

    const {socket, axios, authUser} = useContext(AuthContext);

    // ++++++++++++++++++++
    const myAudio = useRef();
    const userAudio = useRef();
    const connectionRef = useRef();
    // ++++++++++++++++++++++

    //function to get all users for sidebar
    const getUsers = async () => {
        try {
           const { data } =  await axios.get("/api/messages/users");
            if (data.success) {
                setUsers(data.users)
                setUnseenMessages(data.unseenMessages)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    //function to get messages for selected users
    const getMessages = async (userId) => {
        try {
          const { data } =  await axios.get(`/api/messages/${userId}`);
          if (data.success) {
            setMessages(data.messages)
          }
        } catch (error) {
            toast.error(error.message)
        }
    }

    //functon to send message to selected user
    const sendMessage = async (messageData) => {
        try {
            const { data } = await axios.post(`/api/messages/send/${selectedUser._id}`, messageData);
            if (data.success) {
                setMessages((prevmessages)=>[...prevmessages, data.newMessage])
            }else{
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    //function to subscribe to messages for selected user
    const subscribeToMessages = async () => {
        if (!socket) return;

        socket.on("newMessage", (newMessage)=>{
            if (selectedUser && newMessage.senderId === selectedUser._id){
                newMessage.seen = true;
                setMessages((prevmessages)=>[...prevmessages, newMessage]);
                axios.put(`/api/messages/mark/${newMessage._id}`);
            }else{
                setUnseenMessages((prevUnseenMessages)=>({
                    ...prevUnseenMessages, [newMessage.senderId] : prevUnseenMessages[newMessage.senderId] ? prevUnseenMessages[newMessage.senderId] + 1 : 1
                }))
            }
        })

        socket.on("messageDeleted", ({ messageId }) => {
            setMessages((prevMessages) =>
                prevMessages.map((msg) => {
                    if (msg._id === messageId) {
                        return { ...msg, isDeleted: true, text: "", image: "" };
                    }
                    return msg;
                })
            );
        });

    }

    //function to unsubscriibe from messages
    const unsubscriibeFromMesssages = ()=>{
        if (socket) {
            socket.off("newMessage") ;
            socket.off("messageDeleted");
        }   
    }

    // Delete message handler
    const deleteMessage = async (messageId, forEveryone = false) => {
        try {
            const { data } = await axios.post("/api/messages/delete", {
                messageId,
                forEveryone,
            });

            if (data.success) {
                // Optimistic update to message list
                setMessages((prevMessages) =>
                    prevMessages.map((msg) => {
                        if (msg._id === messageId) {
                            if (forEveryone) {
                                return { ...msg, isDeleted: true, text: "", image: "" };
                            } else {
                                return null; // For "delete for me", we remove it locally
                            }
                        }
                        return msg;
                    }).filter(Boolean) // removes nulls (deleted-for-me)
                );
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    // +++++++++++++++++++++++++++++++

    const getMedia = async () => {
        const currentStream = await navigator.mediaDevices.getUserMedia({
            audio: true,
        });
        setStream(currentStream);

        if (myAudio.current) {
            myAudio.current.srcObject = currentStream;
        }
    };


    const callUser = async (userId) => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true
            });

            setStream(stream);

            // ✅ ADD THIS (VERY IMPORTANT)
            setCall({
                isCalling: true,
                from: authUser._id,
                to: userId
            });

            if (myAudio.current) {
                myAudio.current.srcObject = stream;
            }

            const peer = new Peer({
                initiator: true,
                trickle: false,
                stream,
            });

            peer.on("signal", (data) => {
                socket.emit("callUser", {
                    userToCall: userId,
                    signalData: data,
                    from: authUser._id,
                    name: authUser.fullName
                });
            });

            peer.on("stream", (remoteStream) => {
                userAudio.current.srcObject = remoteStream;
            });

            connectionRef.current = peer;

        } catch (error) {
            console.log(error);
        }
    };

    const answerCall = async () => {
        setCallAccepted(true);

        const stream = await navigator.mediaDevices.getUserMedia({
            audio: true
        });

        setStream(stream);

        if (myAudio.current) {
            myAudio.current.srcObject = stream;
        }

        const peer = new Peer({
            initiator: false,
            trickle: false,
            stream,
        });

        peer.on("signal", (data) => {
            socket.emit("answerCall", {
                signal: data,
                to: call.from,
            });
        });

        peer.on("stream", (remoteStream) => {
            userAudio.current.srcObject = remoteStream;
        });

        if (call?.signal) {
            peer.signal(call.signal);
        }

        connectionRef.current = peer;
    };

    const endCall = () => {
        setCallEnded(true);

        connectionRef.current?.destroy();

        socket.emit("endCall", { to: call?.from });

        // ✅ RESET EVERYTHING
        setCall({});
        setCallAccepted(false);
        setCallEnded(false);

        // stop mic
        stream?.getTracks().forEach(track => track.stop());
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;

        return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
    };
    // ++++++++++++++++++++++++++++++


    useEffect(() => {
        subscribeToMessages();;
        return ()=> unsubscriibeFromMesssages();
    },[socket, selectedUser]);

    // +++++++++++++++++++++++++++
    useEffect(() => {
        if (!socket) return;

        socket.on("incomingCall", ({ from, signal, name }) => {
            setSelectedUser({ _id: from, fullName: name });
            setCall({
                isReceivingCall: true,
                from,
                signal,
                name
            });
        });

        socket.on("callAccepted", (signal) => {
            setCallAccepted(true);
            setCallTime(0);

            if (connectionRef.current) {
                connectionRef.current.signal(signal);
            }
        });

        socket.on("callEnded", () => {
            setCallEnded(true);
            connectionRef.current?.destroy();
            setCallTime(0);
        });

        return () => {
            socket.off("incomingCall");
            socket.off("callAccepted");
            socket.off("callEnded");
        };

    }, [socket]);

    useEffect(() => {
        let interval;

        if (callAccepted && !callEnded) {
            interval = setInterval(() => {
                setCallTime(prev => prev + 1);
            }, 1000);
        }

        return () => clearInterval(interval);
    }, [callAccepted, callEnded]);
    // ++++++++++++++++++++++++++

    const value = {
        messages,
        users, 
        selectedUser, 
        getUsers, 
        getMessages, 
        sendMessage, 
        deleteMessage, 
        setSelectedUser, 
        unseenMessages, 
        setUnseenMessages,
        call,
        callAccepted,
        callEnded,
        stream,
        callUser,
        answerCall,
        endCall,
        myAudio,
        userAudio,
        formatTime,
        getMedia,
        callTime
    }
    return (
    <ChatContext.Provider value={value}>
        {children}
    </ChatContext.Provider>
    )
}